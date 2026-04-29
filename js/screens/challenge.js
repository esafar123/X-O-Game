import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn, Icon } from "../ui/icons.js";
import { TopBar, Avatar, PitchButton } from "../ui/components.js";
import { db } from "../core/db.js";
import { decodeHTML, shuffle } from "../utils/helpers.js";

SCREENS.challenge = () => {
  const myCode  = state.profile?.friend_code || null;
  const myName  = state.profile?.nickname    || null;
  const toCode  = state.challengeCode;

  const wrap = h("div", { class: "screen-scroll pitch-bg-app" });
  wrap.appendChild(TopBar({
    title:   "Challenge",
    leading: IconBtn({ name: "back", onClick: () => go("home") }),
  }));

  // No profile — ask to create one
  if (!myCode || !myName) {
    wrap.appendChild(h("div", { class: "af-empty" },
      h("div", { class: "af-empty-title" }, "Profile required"),
      h("div", { class: "af-empty-sub" }, "Create a profile to challenge this player."),
      h("div", { style: { marginTop: "20px", padding: "0 20px" } },
        PitchButton({ label: "Create Profile", variant: "primary", full: true, onClick: () => go("onboarding") }),
      ),
    ));
    return wrap;
  }

  const statusEl = h("div", { class: "chal-status" });
  const body     = h("div", { class: "chal-body" });
  wrap.appendChild(body);
  wrap.appendChild(statusEl);

  let challengeId = null;
  let pollId      = null;

  const cleanup = () => { clearInterval(pollId); pollId = null; };
  onUnmount(cleanup);

  // ── Load challenged player ────────────────────────────────────────
  (async () => {
    body.appendChild(h("div", { class: "chal-loading" }, "Loading…"));

    const { data: target } = await db
      .from("profiles")
      .select("nickname, friend_code")
      .eq("friend_code", toCode)
      .maybeSingle();

    body.innerHTML = "";

    if (!target) {
      body.appendChild(h("div", { class: "af-empty" },
        h("div", { class: "af-empty-title" }, "Player not found"),
        h("div", { class: "af-empty-sub" }, "This QR code doesn't match any profile."),
      ));
      return;
    }

    // ── Challenge card ──────────────────────────────────────────────
    body.appendChild(h("div", { class: "chal-card" },
      Avatar({ initial: target.nickname[0]?.toUpperCase() || "?", size: 72 }),
      h("div", { class: "chal-vs" }, "VS"),
      h("div", { class: "chal-name" }, target.nickname),
      h("div", { class: "chal-sub"  }, "Scan accepted · ready to play?"),
    ));

    const sendBtn = h("div", { style: { padding: "0 20px", marginTop: "24px" } },
      PitchButton({
        label: "Send Challenge", variant: "primary", full: true, icon: "bolt",
        onClick: sendChallenge,
      }),
    );
    body.appendChild(sendBtn);

    // ── Send challenge ──────────────────────────────────────────────
    async function sendChallenge() {
      sendBtn.style.display = "none";
      statusEl.textContent  = "Waiting for opponent to accept…";
      statusEl.style.color  = "var(--fg-3)";

      // Clean up any stale pending challenge first
      await db.from("challenges")
        .delete()
        .eq("from_code", myCode)
        .eq("to_code", toCode)
        .eq("status", "pending");

      const { data, error } = await db.from("challenges").insert({
        from_code: myCode,
        from_name: myName,
        to_code:   toCode,
        status:    "pending",
      }).select("id").single();

      if (error || !data) {
        statusEl.textContent = "Couldn't send — try again.";
        statusEl.style.color = "var(--eliminate)";
        sendBtn.style.display = "";
        return;
      }

      challengeId = data.id;

      // Cancel button while waiting
      const cancelWrap = h("div", { style: { padding: "12px 20px 0" } },
        PitchButton({ label: "Cancel", variant: "ghost", full: true, onClick: cancelChallenge }),
      );
      body.appendChild(cancelWrap);

      // Poll for response
      pollId = setInterval(async () => {
        const { data: row } = await db
          .from("challenges")
          .select("status, game_code")
          .eq("id", challengeId)
          .maybeSingle();

        if (!row) {
          // Challenge was deleted (declined)
          cleanup();
          statusEl.textContent = "Challenge declined.";
          statusEl.style.color = "var(--eliminate)";
          cancelWrap.remove();
          sendBtn.style.display = "";
          challengeId = null;
          return;
        }

        if (row.status === "accepted" && row.game_code) {
          cleanup();
          // Join the game the host created
          state.joinCode    = row.game_code;
          state.playerRole  = "guest";
          state.opponent    = { nm: target.nickname, init: target.nickname[0]?.toUpperCase() || "?", status: "online", meta: "Challenge", stats: "" };
          state.score       = { x: 0, o: 0 };
          go("join");
        }
      }, 3000);
    }

    async function cancelChallenge() {
      cleanup();
      if (challengeId) {
        await db.from("challenges").delete().eq("id", challengeId);
        challengeId = null;
      }
      go("home");
    }
  })();

  return wrap;
};

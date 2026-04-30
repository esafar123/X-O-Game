import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn } from "../ui/icons.js";
import { TopBar, Avatar, Badge, PitchButton } from "../ui/components.js";
import { db } from "../core/db.js";

SCREENS.friends = () => {
  const myCode = state.profile?.friend_code || null;
  const wrap   = h("div", { class: "screen-scroll" });

  wrap.appendChild(TopBar({
    title:    "Roster",
    leading:  IconBtn({ name: "back",  onClick: () => go("home")       }),
    trailing: IconBtn({ name: "plus",  onClick: () => go("add_friend") }),
  }));

  // ── Guest / no-profile state ─────────────────────────────────────
  if (!myCode) {
    wrap.appendChild(h("div", { class: "af-empty" },
      h("div", { class: "af-empty-title" }, "No profile yet"),
      h("div", { class: "af-empty-sub"   }, "Create a profile to add and challenge friends."),
      h("div", { style: { marginTop: "20px" } },
        PitchButton({ label: "Create Profile", variant: "primary", full: true, onClick: () => go("onboarding") }),
      ),
    ));
    return wrap;
  }

  // ── Loading skeleton ─────────────────────────────────────────────
  const countEl   = h("div", { class: "row-gap-8" });
  const pendingEl = h("div", { class: "list" });
  const friendsEl = h("div", { class: "list" });

  wrap.appendChild(countEl);
  wrap.appendChild(pendingEl);
  wrap.appendChild(friendsEl);

  // ── Helpers ──────────────────────────────────────────────────────
  function renderCounts(pending, total) {
    countEl.innerHTML = "";
    if (pending > 0) countEl.appendChild(Badge({ label: `${pending} pending`, tone: "flood" }));
    countEl.appendChild(Badge({ label: `${total} friend${total !== 1 ? "s" : ""}`, tone: "default" }));
  }

  function FriendRow({ name, meta, onChallenge }) {
    const init = name[0]?.toUpperCase() || "?";
    return h("div", { class: "friend-row" },
      Avatar({ initial: init, size: 42 }),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { class: "nm"   }, name),
        h("div", { class: "meta" }, meta),
      ),
      h("button", {
        class: "friend-action challenge", type: "button",
        onclick: onChallenge,
      }, "Challenge"),
    );
  }

  function PendingRow({ name, code, reqId, onAccept, onDecline }) {
    return h("div", { class: "friend-row pending-row" },
      Avatar({ initial: name[0]?.toUpperCase() || "?", size: 42 }),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { class: "nm"   }, name),
        h("div", { class: "meta" }, `${code} · wants to be friends`),
      ),
      h("div", { class: "pending-actions" },
        h("button", { class: "friend-action challenge", type: "button", onclick: onAccept  }, "✓"),
        h("button", { class: "friend-action invite",   type: "button", onclick: onDecline }, "✕"),
      ),
    );
  }

  // ── Load from DB ─────────────────────────────────────────────────
  let pollId = null;

  const load = async () => {
    // Pending incoming requests
    const { data: incoming = [] } = await db
      .from("friend_requests")
      .select("id, from_code, from_name, status")
      .eq("to_code", myCode)
      .eq("status", "pending");

    // Accepted friendships (either direction)
    const { data: accepted = [] } = await db
      .from("friend_requests")
      .select("id, from_code, from_name, to_code, to_name")
      .eq("status", "accepted")
      .or(`from_code.eq.${myCode},to_code.eq.${myCode}`);

    renderCounts(incoming.length, accepted.length);

    // Pending section
    pendingEl.innerHTML = "";
    if (incoming.length > 0) {
      pendingEl.appendChild(h("div", { class: "section-label" }, "Requests"));
      for (const req of incoming) {
        pendingEl.appendChild(PendingRow({
          name: req.from_name,
          code: req.from_code,
          reqId: req.id,
          onAccept: async () => {
            await db.from("friend_requests")
              .update({ status: "accepted" })
              .eq("from_code", req.from_code)
              .eq("to_code", myCode);
            load();
          },
          onDecline: async () => {
            await db.from("friend_requests")
              .delete()
              .eq("from_code", req.from_code)
              .eq("to_code", myCode);
            load();
          },
        }));
      }
    }

    // Friends section
    friendsEl.innerHTML = "";
    if (accepted.length > 0) {
      friendsEl.appendChild(h("div", { class: "section-label" }, "Friends"));
      for (const fr of accepted) {
        // Determine which side is the friend
        const isFromMe   = fr.from_code === myCode;
        const friendName = isFromMe ? (fr.to_name   || fr.to_code)   : fr.from_name;
        const friendCode = isFromMe ?  fr.to_code                     : fr.from_code;
        friendsEl.appendChild(FriendRow({
          name: friendName,
          meta: friendCode,
          onChallenge: () => {
            state.challengeCode = friendCode;
            go("challenge");
          },
        }));
      }
    } else if (incoming.length === 0) {
      friendsEl.appendChild(h("div", { class: "af-empty" },
        h("div", { class: "af-empty-title" }, "No friends yet"),
        h("div", { class: "af-empty-sub"   }, "Tap + to add someone by their friend code."),
      ));
    }
  };

  load();

  // Re-fetch every 10 s to catch incoming requests while screen is open
  pollId = setInterval(load, 10000);
  onUnmount(() => clearInterval(pollId));

  return wrap;
};

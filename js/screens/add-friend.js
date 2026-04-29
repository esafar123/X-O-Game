import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn } from "../ui/icons.js";
import { TopBar, Avatar, PitchButton } from "../ui/components.js";
import { db } from "../core/db.js";
import { validateInviteCode, rateLimit } from "../utils/sanitize.js";

SCREENS.add_friend = () => {
  const myCode = state.profile?.friend_code || "";
  const myName = state.profile?.nickname    || "";

  const wrap = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({
    title:   "Add Friend",
    leading: IconBtn({ name: "back", onClick: () => go("friends") }),
  }));

  // ── Your own code (share it) ──────────────────────────────────────
  const copyBtn = h("button", { class: "af-copy-btn", type: "button",
    onclick: () => {
      navigator.clipboard?.writeText(myCode).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.innerHTML = ""; copyBtn.appendChild(Icon({ name: "plus", size: 14 })); copyBtn.appendChild(document.createTextNode(" Copy")); }, 1800);
      });
    },
  });
  copyBtn.appendChild(Icon({ name: "plus", size: 14 }));
  copyBtn.appendChild(document.createTextNode(" Copy"));

  wrap.appendChild(h("div", { class: "af-section" },
    h("div", { class: "section-label" }, "Your code — share it"),
    h("div", { class: "af-my-code" },
      h("div", { class: "af-code-text" }, myCode || "No profile yet"),
      copyBtn,
    ),
  ));

  // ── Search section ───────────────────────────────────────────────
  wrap.appendChild(h("div", { class: "section-label", style: { marginTop: "24px" } }, "Find a player"));

  const input = h("input", {
    class: "onb-input af-input", type: "text",
    placeholder: "XO-NAME-1234",
    maxlength: "16",
    autocomplete: "off", spellcheck: "false",
    oninput: () => { statusMsg.textContent = ""; resultArea.innerHTML = ""; },
  });

  const statusMsg  = h("div", { class: "join-status", style: { marginTop: "8px" } });
  const resultArea = h("div", { class: "af-result" });

  let foundProfile = null;

  const doSearch = rateLimit(async () => {
    const raw  = input.value.trim();
    const code = validateInviteCode(raw);

    if (!code) {
      statusMsg.textContent = "Enter a valid code — format XO-NAME-1234";
      statusMsg.style.color = "var(--eliminate)";
      return;
    }
    if (code === myCode) {
      statusMsg.textContent = "That's your own code!";
      statusMsg.style.color = "var(--eliminate)";
      return;
    }

    statusMsg.textContent = "Searching…";
    statusMsg.style.color = "var(--flood-500)";
    resultArea.innerHTML  = "";
    foundProfile          = null;

    // Look up profile
    const { data: profile, error } = await db
      .from("profiles")
      .select("nickname, friend_code")
      .eq("friend_code", code)
      .maybeSingle();

    if (error || !profile) {
      statusMsg.textContent = "No player found with that code.";
      statusMsg.style.color = "var(--eliminate)";
      return;
    }

    // Check if a request already exists (either direction)
    const { data: existing } = await db
      .from("friend_requests")
      .select("status")
      .or(
        `and(from_code.eq.${myCode},to_code.eq.${code}),` +
        `and(from_code.eq.${code},to_code.eq.${myCode})`
      )
      .maybeSingle();

    if (existing) {
      statusMsg.textContent =
        existing.status === "accepted" ? "You're already friends!" : "Request already sent or pending.";
      statusMsg.style.color = "var(--fg-2)";
      return;
    }

    // Show found player card
    foundProfile        = profile;
    statusMsg.textContent = "";

    const card = h("div", { class: "af-found-card" });
    card.appendChild(Avatar({ initial: profile.nickname[0]?.toUpperCase() || "?", size: 48 }));
    card.appendChild(h("div", { class: "af-found-info" },
      h("div", { class: "nm"   }, profile.nickname),
      h("div", { class: "meta" }, profile.friend_code),
    ));
    resultArea.appendChild(card);
    resultArea.appendChild(h("div", { style: { marginTop: "12px" } },
      PitchButton({
        label: "Send Friend Request", variant: "primary", full: true, icon: "plus",
        onClick: doSend,
      }),
    ));
  }, 1200);

  const doSend = rateLimit(async () => {
    if (!foundProfile || !myCode) return;

    statusMsg.textContent = "Sending…";
    statusMsg.style.color = "var(--flood-500)";

    const { error } = await db.from("friend_requests").insert({
      from_code: myCode,
      to_code:   foundProfile.friend_code,
      from_name: myName,
      to_name:   foundProfile.nickname,
      status:    "pending",
    });

    if (error) {
      statusMsg.textContent = error.code === "23505"
        ? "Request already sent."
        : "Couldn't send — try again.";
      statusMsg.style.color = "var(--eliminate)";
      return;
    }

    const sentTo           = foundProfile.nickname;
    resultArea.innerHTML   = "";
    input.value            = "";
    foundProfile           = null;
    statusMsg.textContent  = `✓ Request sent to ${sentTo}!`;
    statusMsg.style.color  = "var(--win)";
  }, 2000);

  // Wire search on Enter key too
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

  const searchRow = h("div", { class: "af-search-row" });
  searchRow.appendChild(input);
  searchRow.appendChild(PitchButton({ label: "Search", variant: "primary", onClick: doSearch }));

  wrap.appendChild(h("div", { class: "af-section" },
    searchRow,
    statusMsg,
    resultArea,
  ));

  return wrap;
};

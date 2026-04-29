import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Logo } from "../ui/icons.js";
import { PitchButton } from "../ui/components.js";
import { db } from "../core/db.js";
import { generateFriendCode } from "../utils/helpers.js";

SCREENS.join = () => {
  const code        = state.joinCode || "";
  const inviterName = code.replace(/^XO-/, "").replace(/-\d+$/, "");
  const wrap        = h("div", { class: "screen-scroll pitch-bg-app splash" });

  const hero = h("div", { class: "hero" });
  hero.appendChild(Logo({ size: 80 }));
  hero.appendChild(h("div", { class: "wordmark" },
    h("span", { style: { fontSize: "18px", letterSpacing: "0.12em" } }, inviterName),
    h("br"),
    h("span", { class: "accent", style: { fontSize: "28px" } }, "INVITED YOU"),
  ));
  hero.appendChild(h("div", { class: "tagline" }, `Code: ${code}`));
  wrap.appendChild(hero);

  const statusMsg = h("div", { class: "join-status" });
  const actions   = h("div", { class: "actions" });

  actions.appendChild(PitchButton({
    label: "Accept & Play", variant: "primary", full: true, iconRight: "forward",
    onClick: async () => {
      // Auto-create guest profile if scanner hasn't registered
      if (!state.profile) {
        const POOL        = ["Shadow_GK", "Night_Striker", "Ghost_Winger", "Phantom_CF", "Dark_Keeper"];
        const nickname    = POOL[Math.floor(Math.random() * POOL.length)];
        const friend_code = generateFriendCode(nickname);
        const profile     = { nickname, gender: "guest", friend_code, is_guest: true };
        localStorage.setItem("xo_profile", JSON.stringify(profile));
        state.profile = profile;
      }
      const myName = state.profile.nickname;
      statusMsg.textContent  = "Looking up game…";
      statusMsg.style.color  = "var(--flood-500)";

      // Find the host's game row
      const { data: game, error } = await db
        .from("games").select("*").eq("invite_code", code).single();

      if (error || !game) {
        statusMsg.textContent = "Game not found — ask the host to re-open their waiting screen.";
        statusMsg.style.color = "var(--eliminate)";
        return;
      }
      if (game.status !== "waiting") {
        statusMsg.textContent = "Host hasn't opened a new lobby yet — tap again in a moment.";
        statusMsg.style.color = "var(--flood-500)";
        return;
      }

      statusMsg.textContent = "Joining…";
      const { error: joinErr } = await db
        .from("games")
        .update({ guest_name: myName, status: "active" })
        .eq("invite_code", code);

      if (joinErr) {
        statusMsg.textContent = "Failed to join — try again.";
        statusMsg.style.color = "var(--eliminate)";
        return;
      }

      state.opponent       = { nm: game.host_name, init: game.host_name[0]?.toUpperCase() || "?", status: "online", meta: "Via QR invite", stats: "" };
      state.playerRole     = "guest";
      state.gameCode       = code;
      state.score          = { x: 0, o: 0 };
      state.triviaQuestion = game.q_json ? JSON.parse(game.q_json) : null;
      go("trivia_mp");
    },
  }));

  actions.appendChild(statusMsg);
  actions.appendChild(PitchButton({
    label: "Continue as guest", variant: "ghost", full: true,
    onClick: () => go("home"),
  }));
  wrap.appendChild(actions);
  return wrap;
};

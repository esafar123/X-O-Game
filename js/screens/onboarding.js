import { SCREENS, state, go, render } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon } from "../ui/icons.js";
import { Avatar, PitchButton, TopBar } from "../ui/components.js";
import { db } from "../core/db.js";
import { generateFriendCode } from "../utils/helpers.js";
import { GUEST_POOL } from "../data/constants.js";
import { sanitizeText, validateNickname } from "../utils/sanitize.js";

SCREENS.onboarding = () => {
  const wrap    = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({ title: "Create Profile", subtitle: "One-time setup" }));

  const initial = state.onboarding.nickname ? state.onboarding.nickname[0].toUpperCase() : "?";
  wrap.appendChild(h("div", { class: "onb-avatar-wrap" },
    Avatar({ initial, size: 72 }),
  ));

  const input = h("input", {
    class: "onb-input", type: "text",
    placeholder: "Your nickname…", maxlength: "16",
    value: state.onboarding.nickname,
  });
  input.addEventListener("input", () => { state.onboarding.nickname = sanitizeText(input.value); });
  wrap.appendChild(h("div", { class: "onb-field" },
    h("div", { class: "section-label" }, "Nickname"),
    input,
  ));

  wrap.appendChild(h("div", { class: "onb-field" },
    h("div", { class: "section-label" }, "You play as"),
    h("div", { class: "onb-gender-row" },
      ...["Male", "Female"].map(g => {
        const sel = state.onboarding.gender === g.toLowerCase();
        const btn = h("button", {
          class: `onb-gender-btn ${sel ? "sel" : ""}`,
          type: "button",
          onclick: () => { state.onboarding.gender = g.toLowerCase(); render(); },
        });
        btn.appendChild(Icon({ name: g.toLowerCase(), size: 30, color: "currentColor" }));
        btn.appendChild(h("span", { class: "onb-gender-label" }, g));
        return btn;
      }),
    ),
  ));

  const ready = validateNickname(state.onboarding.nickname) && state.onboarding.gender;
  wrap.appendChild(h("div", { class: "onb-actions" },
    PitchButton({
      label: "Create Profile", variant: "primary", full: true, iconRight: "forward",
      disabled: !ready,
      onClick: () => {
        const nickname    = validateNickname(state.onboarding.nickname);
        if (!nickname) return;
        const gender      = state.onboarding.gender;
        const friend_code = generateFriendCode(nickname);
        const profile     = { nickname, gender, friend_code };
        localStorage.setItem("xo_profile", JSON.stringify(profile));
        state.profile = profile;
        go("code_reveal");
        db.from("profiles").insert(profile).select().single().then(({ data }) => {
          if (data?.id) {
            profile.id = data.id;
            localStorage.setItem("xo_profile", JSON.stringify(profile));
          }
        });
      },
    }),
  ));

  wrap.appendChild(h("div", { class: "onb-guest-wrap" },
    h("span", { class: "onb-guest-or" }, "or"),
    h("button", {
      class: "onb-guest-btn", type: "button",
      onclick: () => {
        const nickname    = GUEST_POOL[Math.floor(Math.random() * GUEST_POOL.length)];
        const friend_code = generateFriendCode(nickname);
        const profile     = { nickname, gender: "guest", friend_code, is_guest: true };
        localStorage.setItem("xo_profile", JSON.stringify(profile));
        state.profile = profile;
        go("home");
      },
    }, "Continue as Guest"),
  ));

  return wrap;
};

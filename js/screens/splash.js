import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Logo } from "../ui/icons.js";
import { PitchButton } from "../ui/components.js";

SCREENS.splash = () => {
  const wrap    = h("div", { class: "screen-scroll pitch-bg-app splash" });
  const hero    = h("div", { class: "hero" });
  hero.appendChild(Logo({ size: 108 }));
  hero.appendChild(h("div", { class: "wordmark" },
    "PITCH", h("br"),
    h("span", { class: "accent" }, "X", h("span", { class: "dot" }, "·"), "O"),
  ));
  hero.appendChild(h("div", { class: "tagline" }, "The floodlit night-game"));
  wrap.appendChild(hero);

  const actions = h("div", { class: "actions" });
  actions.appendChild(PitchButton({
    label: "READY UP", variant: "primary", full: true, iconRight: "forward",
    onClick: () => go(state.profile ? "home" : "onboarding"),
  }));
  actions.appendChild(PitchButton({
    label: "Continue as guest", variant: "ghost", full: true,
    onClick: () => go("home"),
  }));
  actions.appendChild(h("div", { class: "ver" }, "v 1.0 · Pre-season"));
  wrap.appendChild(actions);
  return wrap;
};

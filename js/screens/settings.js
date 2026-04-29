import { SCREENS, state, go, render } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn, XMark, OMark } from "../ui/icons.js";
import { TopBar, Avatar, SettingRow, Toggle, TeamPicker } from "../ui/components.js";

SCREENS.settings = () => {
  const wrap = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({
    title:   "Settings",
    leading: IconBtn({ name: "back", onClick: () => go("home") }),
  }));

  // Profile row
  wrap.appendChild(h("div", { class: "setting-group" },
    h("div", { class: "setting-row profile-row" },
      Avatar({ initial: state.profile?.nickname?.[0]?.toUpperCase() || "?", size: 44 }),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { class: "nm"   }, state.profile?.nickname || "You_pitch"),
        h("div", { class: "meta" }, "Pro Pitch · #214"),
      ),
      Icon({ name: "forward", size: 18, color: "var(--fg-3)" }),
    ),
  ));

  wrap.appendChild(h("div", { class: "section-label" }, "Game"));
  wrap.appendChild(h("div", { class: "setting-group" },
    SettingRow("Sound effects", Toggle(state.sound,   () => { state.sound   = !state.sound;   render(); })),
    SettingRow("Haptics",       Toggle(state.haptics, () => { state.haptics = !state.haptics; render(); })),
    SettingRow("Default team",  TeamPicker(state.team, (t) => { state.team = t; render(); })),
  ));

  wrap.appendChild(h("div", { class: "section-label" }, "Account"));
  wrap.appendChild(h("div", { class: "setting-group" },
    SettingRow("Friend code",   h("span", { class: "friend-code" }, state.profile?.friend_code || "—")),
    SettingRow("Privacy",       Icon({ name: "forward", size: 16, color: "var(--fg-3)" })),
    SettingRow("Notifications", Icon({ name: "forward", size: 16, color: "var(--fg-3)" })),
  ));

  wrap.appendChild(h("div", { style: { padding: "20px" } },
    h("button", {
      class: "pbtn ghost full", type: "button",
      onclick: () => {
        localStorage.removeItem("xo_profile");
        state.profile    = null;
        state.onboarding = { nickname: "", gender: "" };
        go("splash");
      },
    }, "Sign out"),
  ));

  return wrap;
};

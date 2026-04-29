import { SCREENS, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn } from "../ui/icons.js";
import { TopBar, Avatar, Badge } from "../ui/components.js";
import { FRIENDS } from "../data/constants.js";

SCREENS.friends = () => {
  const wrap = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({
    title:    "Roster",
    leading:  IconBtn({ name: "back", onClick: () => go("home") }),
    trailing: IconBtn({ name: "plus" }),
  }));
  wrap.appendChild(h("div", { class: "row-gap-8" },
    Badge({ label: "3 online", tone: "flood" }),
    Badge({ label: "6 total",  tone: "default" }),
  ));

  const list = h("div", { class: "list" });
  for (const f of FRIENDS) {
    const row = h("div", { class: `friend-row ${f.status === "offline" ? "offline" : ""}` },
      Avatar({ initial: f.init, size: 42, team: f.team, status: f.status }),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { class: "nm"   }, f.nm),
        h("div", { class: "meta" }, f.meta),
      ),
      h("div", { class: "stats" }, f.stats),
      f.status === "online"
        ? h("button", { class: "friend-action challenge", type: "button", onclick: () => go("matchmaking", { opponent: f }) }, "Challenge")
        : f.status === "busy"
          ? h("button", { class: "friend-action watch",  type: "button" }, "Watch")
          : h("button", { class: "friend-action invite", type: "button" }, "Invite"),
    );
    list.appendChild(row);
  }
  wrap.appendChild(list);
  return wrap;
};

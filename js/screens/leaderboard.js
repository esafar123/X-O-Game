import { SCREENS, state, render } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn } from "../ui/icons.js";
import { TopBar, Avatar, PodiumCol } from "../ui/components.js";
import { LB_DATA } from "../data/constants.js";
import { go } from "../core/router.js";

SCREENS.leaderboard = () => {
  const wrap = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({
    title:   "Leaderboard",
    leading: IconBtn({ name: "back", onClick: () => go("home") }),
  }));

  const tabs = h("div", { class: "tabs" });
  for (const k of ["global", "friends", "weekly"]) {
    tabs.appendChild(h("button", {
      class:   `tab ${state.leaderboardTab === k ? "active" : ""}`,
      type:    "button",
      onclick: () => { state.leaderboardTab = k; render(); },
    }, k));
  }
  wrap.appendChild(tabs);

  const rows = LB_DATA[state.leaderboardTab] || LB_DATA.global;
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  if (top3.length === 3) {
    const podium = h("div", { class: "podium" });
    const byRk   = (rk) => top3.find(p => p.rk === rk) || top3[rk - 1];
    const p2 = byRk(2), p1 = byRk(1), p3 = byRk(3);
    podium.appendChild(PodiumCol({ rk: p2.rk, nm: p2.nm, init: p2.init, pts: p2.w, h: 92,  top: false }));
    podium.appendChild(PodiumCol({ rk: p1.rk, nm: p1.nm, init: p1.init, pts: p1.w, h: 120, top: true  }));
    podium.appendChild(PodiumCol({ rk: p3.rk, nm: p3.nm, init: p3.init, pts: p3.w, h: 72,  top: false }));
    wrap.appendChild(podium);
  }

  const list = h("div", { class: "list" });
  for (const p of rest) {
    list.appendChild(h("div", { class: `lb-row ${p.you ? "you" : ""}` },
      h("div", { class: "rk" }, "#" + p.rk),
      Avatar({ initial: p.init, size: 32 }),
      h("div", null,
        h("div", { class: "nm"      }, p.nm),
        h("div", { class: "winrate" }, p.win + "% win"),
      ),
      h("div", { class: "pts" }, String(p.w)),
    ));
  }
  wrap.appendChild(list);
  return wrap;
};

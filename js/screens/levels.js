import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn } from "../ui/icons.js";
import { TopBar, LeagueCard } from "../ui/components.js";
import { LEAGUES } from "../data/constants.js";

SCREENS.levels = () => {
  const wrap = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({
    title:    "Leagues",
    leading:  IconBtn({ name: "back", onClick: () => go("home") }),
    trailing: IconBtn({ name: "more" }),
  }));

  wrap.appendChild(h("div", { class: "leagues-head" },
    h("div", { class: "title" }, "PRO ", h("span", { class: "accent" }, "PITCH")),
    h("div", { class: "meta" }, "Currently in this tier · 6/10 wins"),
    h("div", { class: "bar" }, h("span", { style: { width: "60%" } })),
  ));

  const list = h("div", { class: "list", style: { gap: "12px", marginTop: "8px" } });
  for (const L of LEAGUES) list.appendChild(LeagueCard(L, { go, state }));
  wrap.appendChild(list);
  return wrap;
};

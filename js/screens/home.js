import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn } from "../ui/icons.js";
import { TopBar, ActionTile } from "../ui/components.js";
import { LEAGUES } from "../data/constants.js";

SCREENS.home = () => {
  const wrap = h("div", { class: "screen-scroll pitch-bg-app" });
  wrap.appendChild(TopBar({
    title:    "Pitch XO",
    subtitle: "Pre-season · Week 3",
    leading:  IconBtn({ name: "settings", onClick: () => go("settings") }),
    trailing: IconBtn({ name: "friends",  onClick: () => go("friends")  }),
  }));

  wrap.appendChild(h("div", { class: "streak-hero" },
    h("div", { style: { flex: 1 } },
      h("div", { class: "meta" }, "Current streak"),
      h("div", { class: "num"  }, "5W"),
      h("div", { class: "desc" }, "One more win to crack the top 200."),
    ),
    h("div", { class: "bolt-orb" }, Icon({ name: "bolt", size: 40, color: "var(--flood-500)" })),
  ));

  const list = h("div", { class: "action-list" });
  list.appendChild(ActionTile({
    title: "Quick match", desc: "Answer a question · kick off first", icon: "bolt", accent: true,
    onClick: () => { state.opponent = null; state.league = LEAGUES[1]; go("trivia"); },
  }));
  list.appendChild(ActionTile({ title: "Play a friend", desc: "3 friends online",  icon: "swords",  onClick: () => go("friends") }));
  list.appendChild(ActionTile({ title: "Leagues",       desc: "2 of 4 unlocked",   icon: "trophy",  onClick: () => go("levels")  }));
  list.appendChild(ActionTile({ title: "Leaderboard",   desc: "You're ranked #214", icon: "star",   onClick: () => go("leaderboard") }));
  wrap.appendChild(list);
  return wrap;
};

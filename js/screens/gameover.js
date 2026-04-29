import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn, XMark, OMark } from "../ui/icons.js";
import { TopBar, PitchButton, Stat } from "../ui/components.js";

SCREENS.gameover = () => {
  const r       = state.lastResult || { who: "draw", line: [], userMark: state.team };
  const youWon  = r.who === r.userMark;
  const draw    = r.who === "draw";
  const headline = draw ? "STALEMATE." : youWon ? "FULL TIME — YOU WIN" : "FULL TIME";
  const opp     = state.opponent || { nm: "Marcus" };
  const sub     = draw
    ? "Run it back?"
    : youWon
      ? "Clean sheet. Pitch is yours."
      : `${opp.nm} took it ${state.score.o}-${state.score.x}.`;

  const wrap = h("div", { class: "screen-scroll pitch-bg-app gameover" });
  wrap.appendChild(TopBar({
    title:   "Full time",
    leading: IconBtn({ name: "home", onClick: () => go("home") }),
  }));

  const body = h("div", { class: "body" });
  const orb  = h("div", { class: `icon-orb ${youWon ? "win" : "loss"}` });
  if (youWon) {
    orb.appendChild(Icon({ name: "trophy", size: 56, color: "var(--flood-500)" }));
  } else if (draw) {
    const dual = h("div", { style: { display: "flex", gap: "6px" } });
    dual.appendChild(XMark({ size: 32 }));
    dual.appendChild(OMark({ size: 32 }));
    orb.appendChild(dual);
  } else {
    orb.appendChild(r.userMark === "x" ? OMark({ size: 56, glow: true }) : XMark({ size: 56, glow: true }));
  }
  body.appendChild(orb);
  body.appendChild(h("div", { class: `head ${youWon ? "win" : draw ? "draw" : "loss"}` }, headline));
  body.appendChild(h("div", { class: "sub" }, sub));

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  body.appendChild(h("div", { class: "summary" },
    Stat("X-mark", String(state.score.x), "var(--x-chalk)"),
    Stat("O-mark", String(state.score.o), "var(--o-cyan)"),
    Stat("Length", fmtTime(state.lastMatchLengthSec || 74), "var(--flood-500)"),
    Stat("XP",     youWon ? "+34" : "+8",                   "var(--fg-1)"),
  ));
  wrap.appendChild(body);

  const lastRole     = state.lastPlayerRole;
  const rematchLabel = lastRole === "host"  ? "Host again"
                     : lastRole === "guest" ? "Rematch (rejoin)"
                     :                        "Run it back";
  const rematchAction = () => {
    state.score          = { x: 0, o: 0 };
    state.lastPlayerRole = null;
    if      (lastRole === "host")  go("lobby");
    else if (lastRole === "guest") go("join");
    else                           go("matchmaking");
  };

  wrap.appendChild(h("div", { class: "footer" },
    PitchButton({ label: rematchLabel, variant: "primary", full: true, icon: "rematch", onClick: rematchAction }),
    PitchButton({ label: "Back to home", variant: "ghost", full: true,
      onClick: () => { state.score = { x: 0, o: 0 }; state.lastPlayerRole = null; go("home"); },
    }),
  ));
  return wrap;
};

// Shared UI components used across multiple screens

import { h, svg, svgEl } from "../utils/dom.js";
import { Icon, XMark, OMark } from "./icons.js";

export function PitchButton({ label, variant = "primary", full = false, icon, iconRight, disabled = false, onClick }) {
  const cls = ["pbtn", variant, full ? "full" : ""].filter(Boolean).join(" ");
  const btn = h("button", { class: cls, disabled, onclick: disabled ? null : onClick, type: "button" });
  if (icon) btn.appendChild(Icon({ name: icon, size: 16 }));
  btn.appendChild(document.createTextNode(label));
  if (iconRight) btn.appendChild(Icon({ name: iconRight, size: 16 }));
  return btn;
}

export function Avatar({ initial = "?", size = 44, team, status }) {
  const cls = ["avatar", team ? `team-${team}` : ""].filter(Boolean).join(" ");
  const el = h("div", {
    class: cls,
    style: { width: size + "px", height: size + "px", fontSize: (size * 0.4) + "px" },
  }, initial);
  if (status) el.appendChild(h("span", { class: `status ${status}` }));
  return el;
}

export function Badge({ label, tone = "default" }) {
  return h("span", { class: `badge ${tone}` }, label);
}

export function TopBar({ title, subtitle, leading, trailing }) {
  return h("div", { class: "topbar" },
    h("div", { class: "slot" }, leading),
    h("div", { class: "titles" },
      h("div", { class: "title" }, title),
      subtitle ? h("div", { class: "subtitle" }, subtitle) : null,
    ),
    h("div", { class: "slot right" }, trailing),
  );
}

export function TimerRing({ value, total = 15, size = 84, danger = false, label }) {
  const r = 36;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - value / total);
  const color = danger ? "var(--eliminate)" : "var(--flood-500)";
  const glow  = danger ? "rgba(255,46,77,0.6)" : "rgba(212,255,0,0.6)";
  const wrap = h("div", {
    style: {
      width: size + "px", height: size + "px",
      position: "relative", display: "grid", placeItems: "center",
    }
  });
  const ring = svg({ viewBox: "0 0 80 80" });
  ring.style.position = "absolute"; ring.style.inset = 0;
  ring.style.transform = "rotate(-90deg)";
  ring.appendChild(svgEl("circle", {
    cx: 40, cy: 40, r,
    fill: "none", stroke: "rgba(255,255,255,0.08)", "stroke-width": 5,
  }));
  const arc = svgEl("circle", {
    cx: 40, cy: 40, r,
    fill: "none", stroke: color, "stroke-width": 5,
    "stroke-dasharray": C, "stroke-dashoffset": offset,
    "stroke-linecap": "round",
  });
  arc.style.filter = `drop-shadow(0 0 6px ${glow})`;
  arc.style.transition = "stroke-dashoffset 1s linear";
  ring.appendChild(arc);
  wrap.appendChild(ring);
  wrap.appendChild(h("div", {
    style: {
      fontFamily: "var(--font-display)", fontSize: (size * 0.42) + "px",
      color, letterSpacing: "0.04em", lineHeight: 1, position: "relative",
    }
  }, String(value)));
  if (label) wrap.appendChild(h("div", {
    style: {
      position: "absolute", bottom: "-22px", left: 0, right: 0,
      textAlign: "center",
      fontFamily: "var(--font-mono)", fontSize: "10px",
      color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.1em",
    }
  }, label));
  return wrap;
}

export function PlayerCard({ team, name, score, active }) {
  const cls  = ["player-card", team, active ? "active" : ""].filter(Boolean).join(" ");
  const card = h("div", { class: cls });
  card.appendChild(h("div", { class: "head" },
    h("div", { class: "badge-mark" }, team === "x" ? XMark({ size: 16 }) : OMark({ size: 16 })),
    h("div", { class: "nm" }, name),
  ));
  card.appendChild(h("div", { class: "score-num" }, String(score)));
  return card;
}

export function refreshPlayerCard(oldEl, props) {
  const next = PlayerCard(props);
  oldEl.replaceWith(next);
  return next;
}

// ── Screen-specific helpers (used only in one screen but kept here for simplicity) ──

export function ActionTile({ title, desc, icon, accent, onClick }) {
  const cls = ["action-tile", accent ? "accent" : ""].filter(Boolean).join(" ");
  const btn = h("button", { class: cls, type: "button", onclick: onClick });
  btn.appendChild(h("div", { class: "ico" },
    Icon({ name: icon, size: 22, color: accent ? "var(--pitch-900)" : "var(--flood-500)" })));
  btn.appendChild(h("div", { class: "body" },
    h("div", { class: "ttl" }, title),
    h("div", { class: "desc" }, desc),
  ));
  btn.appendChild(Icon({ name: "forward", size: 18, color: accent ? "var(--pitch-900)" : "var(--fg-3)" }));
  return btn;
}

export function LeagueCard(L, { go, state } = {}) {
  const card = h("div", { class: `league-card ${L.unlocked ? "unlocked" : "locked"}` });
  const stars = h("div", { class: "stars" });
  for (let i = 0; i < L.total; i++) {
    const filled = i < L.stars;
    const s = svg({ width: 14, height: 14, viewBox: "0 0 24 24",
      fill: filled ? "var(--flood-500)" : "rgba(255,255,255,0.15)" });
    if (filled) s.style.filter = "drop-shadow(0 0 4px rgba(212,255,0,0.5))";
    s.appendChild(svgEl("polygon", { points: "12,2 15,9 22,9.5 16.5,14 18,21 12,17 6,21 7.5,14 2,9.5 9,9" }));
    stars.appendChild(s);
  }
  card.appendChild(h("div", { class: "row" },
    h("span", { class: "ix" }, `League 0${L.id}`),
    L.unlocked ? stars : Icon({ name: "lock", size: 14, color: "var(--fg-3)" }),
  ));
  card.appendChild(h("div", null,
    h("div", { class: "nm" }, L.name),
    h("div", { class: "desc" }, L.desc),
  ));
  if (L.unlocked) {
    card.appendChild(h("div", { class: "play-row" },
      h("div", { class: "bar thin", style: { flex: 1 } },
        h("span", { style: { width: L.progress + "%" } }),
      ),
      h("button", {
        class: "play-pill", type: "button",
        onclick: () => { if (state && go) { state.league = L; go("trivia"); } },
      },
        Icon({ name: "play", size: 11, color: "var(--pitch-900)" }),
        document.createTextNode(" Play"),
      ),
    ));
  } else {
    card.appendChild(h("div", { class: "lock-msg" },
      Icon({ name: "lock", size: 12, color: "var(--fg-3)" }),
      document.createTextNode(L.lockMsg),
    ));
  }
  return card;
}

export function PodiumCol({ rk, nm, init, pts, h: ht, top }) {
  const col = h("div", { class: `podium-col ${top ? "top" : ""}` });
  const av  = Avatar({ initial: init, size: top ? 54 : 42 });
  if (top) {
    av.style.boxShadow = "var(--glow-flood)";
    av.style.border    = "2px solid var(--flood-500)";
  } else {
    av.style.border = `2px solid ${rk === 2 ? "var(--o-cyan)" : "var(--x-chalk)"}`;
  }
  col.appendChild(av);
  col.appendChild(h("div", { class: "nm" }, nm));
  col.appendChild(h("div", { class: "step", style: { height: ht + "px" } },
    h("div", { class: "pts" }, String(pts)),
  ));
  col.appendChild(h("div", { class: "rk" }, "#" + rk));
  return col;
}

export function Stat(lbl, val, color) {
  return h("div", { class: "stat" },
    h("div", { class: "lbl" }, lbl),
    h("div", { class: "val", style: { color } }, val),
  );
}

export function SettingRow(label, right) {
  return h("div", { class: "setting-row" },
    h("span", { class: "label" }, label),
    right,
  );
}

export function Toggle(on, onChange) {
  return h("button", {
    class: `toggle ${on ? "on" : ""}`, type: "button",
    onclick: onChange, "aria-pressed": String(!!on),
  });
}

export function TeamPicker(value, onChange) {
  const wrap = h("div", { class: "team-picker" });
  for (const t of ["x", "o"]) {
    const sel = value === t;
    const b = h("button", {
      class: `${sel ? "sel " + t : ""}`,
      type: "button",
      onclick: () => onChange(t),
    }, t === "x" ? XMark({ size: 18 }) : OMark({ size: 18 }));
    wrap.appendChild(b);
  }
  return wrap;
}

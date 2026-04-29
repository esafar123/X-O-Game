// Icons (Lucide-style, 2 px stroke) + brand marks

import { h, svg, svgEl } from "../utils/dom.js";

export const ICON_PATHS = {
  back:    [["path", { d: "M19 12H5M11 18l-6-6 6-6" }]],
  forward: [["path", { d: "M5 12h14M13 6l6 6-6 6" }]],
  close:   [["path", { d: "M6 6l12 12M6 18L18 6" }]],
  search:  [["circle", { cx: 11, cy: 11, r: 7 }], ["path", { d: "M21 21l-4.5-4.5" }]],
  trophy:  [["path", { d: "M5 4h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 4z" }], ["path", { d: "M9 4V2h6v2" }]],
  bolt:    [["polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }]],
  star:    [["polygon", { points: "12 2 15 9 22 9.5 16.5 14 18 21 12 17 6 21 7.5 14 2 9.5 9 9" }]],
  clock:   [["circle", { cx: 12, cy: 12, r: 10 }], ["polyline", { points: "12 6 12 12 16 14" }]],
  friends: [["circle", { cx: 9, cy: 8, r: 4 }], ["path", { d: "M2 22a7 7 0 0114 0" }],
            ["circle", { cx: 17, cy: 8, r: 3 }], ["path", { d: "M14 22a5 5 0 018-4" }]],
  settings:[["circle", { cx: 12, cy: 12, r: 3 }],
            ["path", { d: "M19 12a7 7 0 00-.5-2.5l2-1.5-2-3.5-2.5 1a7 7 0 00-2-1L13 2h-2l-1 2.5a7 7 0 00-2 1l-2.5-1-2 3.5 2 1.5A7 7 0 005 12c0 .9.2 1.7.5 2.5l-2 1.5 2 3.5 2.5-1c.6.4 1.3.7 2 1l1 2.5h2l1-2.5c.7-.3 1.4-.6 2-1l2.5 1 2-3.5-2-1.5c.3-.8.5-1.6.5-2.5z" }]],
  play:    [["polygon", { points: "6 3 20 12 6 21 6 3" }]],
  lock:    [["rect", { x: 3, y: 11, width: 18, height: 11, rx: 2 }],
            ["path", { d: "M7 11V7a5 5 0 0110 0v4" }]],
  plus:    [["path", { d: "M12 5v14M5 12h14" }]],
  more:    [["circle", { cx: 5, cy: 12, r: 1.5 }], ["circle", { cx: 12, cy: 12, r: 1.5 }],
            ["circle", { cx: 19, cy: 12, r: 1.5 }]],
  home:    [["path", { d: "M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z" }]],
  rematch: [["path", { d: "M21 12a9 9 0 11-3.5-7.1" }], ["polyline", { points: "21 3 21 9 15 9" }]],
  swords:  [["path", { d: "M14.5 17.5L3 6V3h3l11.5 11.5" }],
            ["path", { d: "M13 19l6-6" }],
            ["path", { d: "M16 16l4 4" }],
            ["path", { d: "M19 21l2-2" }],
            ["path", { d: "M9.5 14.5L21 3h-3L6.5 14.5" }]],
  volume:  [["polygon", { points: "3 9 7 9 12 4 12 20 7 15 3 15" }],
            ["path", { d: "M16 8a5 5 0 010 8" }]],
  male:    [["circle", { cx: 10, cy: 13, r: 6 }],
            ["path",   { d: "M14.2 8.8L21 2M17 2H21V6" }]],
  female:  [["circle", { cx: 12, cy: 9,  r: 6 }],
            ["path",   { d: "M12 15v7M9 19h6" }]],
};

export function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2 }) {
  const root = svg({
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, "stroke-width": strokeWidth,
    "stroke-linecap": "round", "stroke-linejoin": "round",
  });
  for (const [tag, attrs] of (ICON_PATHS[name] || [])) {
    root.appendChild(svgEl(tag, attrs));
  }
  return root;
}

export function IconBtn({ name, color, onClick, ariaLabel }) {
  return h("button", {
    class: "icon-btn", type: "button", onclick: onClick,
    "aria-label": ariaLabel || name,
  }, Icon({ name, size: 18, color: color || "var(--fg-1)" }));
}

// X / O marks
export function XMark({ size = 60, glow = false } = {}) {
  const s = svg({ width: size, height: size, viewBox: "0 0 100 100", fill: "none" });
  if (glow) s.style.filter = "drop-shadow(0 0 12px rgba(255,255,255,0.6))";
  s.appendChild(svgEl("path", {
    d: "M22 22 L78 78 M78 22 L22 78",
    stroke: "#ffffff", "stroke-width": "11", "stroke-linecap": "round",
  }));
  return s;
}

export function OMark({ size = 60, glow = false } = {}) {
  const s = svg({ width: size, height: size, viewBox: "0 0 100 100", fill: "none" });
  if (glow) s.style.filter = "drop-shadow(0 0 12px rgba(0,229,255,0.6))";
  s.appendChild(svgEl("circle", {
    cx: "50", cy: "50", r: "28", stroke: "#00e5ff", "stroke-width": "11",
  }));
  return s;
}

export function Logo({ size = 80 } = {}) {
  const s = svg({ width: size, height: size, viewBox: "0 0 64 64", fill: "none" });
  s.appendChild(svgEl("circle", { cx: 32, cy: 32, r: 29, stroke: "#d4ff00", "stroke-width": 3 }));
  s.appendChild(svgEl("path", {
    d: "M18 18 L46 46 M46 18 L18 46",
    stroke: "#ffffff", "stroke-width": 5.5, "stroke-linecap": "round",
  }));
  s.appendChild(svgEl("circle", { cx: 32, cy: 32, r: 12, stroke: "#00e5ff", "stroke-width": 3.5 }));
  return s;
}

import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h, svg, svgEl } from "../utils/dom.js";
import { Logo, IconBtn } from "../ui/icons.js";
import { TopBar, PitchButton } from "../ui/components.js";
import { FRIENDS } from "../data/constants.js";

SCREENS.matchmaking = () => {
  const wrap = h("div", { class: "screen-scroll pitch-bg-app matchmaking" });
  wrap.appendChild(TopBar({
    title:   "Finding match",
    leading: IconBtn({ name: "close", onClick: () => go("home") }),
  }));

  const body    = h("div", { class: "body" });
  const scanner = h("div", { class: "scanner" });
  const rings   = svg({ viewBox: "0 0 180 180" });
  rings.classList.add("rings");
  [80, 60, 40].forEach((r, i) => {
    rings.appendChild(svgEl("circle", {
      cx: 90, cy: 90, r,
      fill: "none", stroke: "var(--flood-500)", "stroke-width": 2,
      "stroke-opacity": [0.25, 0.4, 0.6][i],
    }));
  });
  scanner.appendChild(rings);
  scanner.appendChild(Logo({ size: 70 }));
  body.appendChild(scanner);
  body.appendChild(h("div", { class: "head" }, "SCANNING THE PITCH"));

  const tickEl = h("div", { class: "tick" }, state.opponent ? `Calling ${state.opponent.nm}…` : "Searching · 0s");
  body.appendChild(tickEl);
  body.appendChild(h("div", { class: "desc" }, "Matching by rank and connection. Average wait: 6 seconds."));
  wrap.appendChild(body);

  wrap.appendChild(h("div", { class: "footer" },
    PitchButton({ label: "Cancel", variant: "ghost", full: true, onClick: () => go("home") }),
  ));

  let t = 0;
  const interval = setInterval(() => {
    t += 1;
    if (!state.opponent) tickEl.textContent = `Searching · ${t}s`;
  }, 1000);
  const timeout = setTimeout(() => {
    if (!state.opponent) {
      const online   = FRIENDS.filter(f => f.status === "online");
      state.opponent = online[Math.floor(Math.random() * online.length)] || FRIENDS[0];
    }
    go("board");
  }, 3500);
  onUnmount(() => { clearInterval(interval); clearTimeout(timeout); });

  return wrap;
};

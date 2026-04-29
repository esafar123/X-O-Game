import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn } from "../ui/icons.js";
import { TopBar } from "../ui/components.js";

SCREENS.home = () => {
  const profile  = state.profile;
  const nick     = profile?.nickname || "Player";
  const code     = profile?.friend_code || null;

  const hour     = new Date().getHours();
  const timeTag  = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const days     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const matchday = `Matchday · ${days[new Date().getDay()]}`;

  const wrap = h("div", { class: "screen-scroll pitch-bg-app" });

  wrap.appendChild(TopBar({
    title:    "Pitch XO",
    subtitle: matchday,
    leading:  IconBtn({ name: "user", onClick: () => go("profile") }),
    trailing: IconBtn({ name: "friends",  onClick: () => go("friends")  }),
  }));

  // ── Greeting + code pill ─────────────────────────────────────────
  const greet = h("div", { class: "home-greet" },
    h("div", { class: "home-greet-time" }, `${timeTag},`),
    h("div", { class: "home-greet-name" }, nick),
  );
  if (code) {
    const tapLabel = h("span", { class: "home-code-tap" }, "tap to copy");
    const pill = h("div", { class: "home-code-pill" },
      h("span", { class: "home-code-val" }, code),
      h("span", { class: "home-code-dot" }, "·"),
      tapLabel,
    );
    pill.onclick = () => {
      navigator.clipboard?.writeText(code).then(() => {
        tapLabel.textContent = "Copied!";
        pill.classList.add("copied");
        setTimeout(() => {
          tapLabel.textContent = "tap to copy";
          pill.classList.remove("copied");
        }, 1800);
      });
    };
    greet.appendChild(pill);
  }
  wrap.appendChild(greet);

  // ── Quick match hero ─────────────────────────────────────────────
  const qm = h("div", { class: "home-qm" });
  qm.appendChild(h("div", { class: "home-qm-eyebrow" },
    h("span", { class: "home-qm-live" }, "LIVE"),
    Icon({ name: "bolt", size: 13, color: "var(--pitch-900)" }),
  ));
  qm.appendChild(h("div", { class: "home-qm-title" }, "Kick Off"));
  qm.appendChild(h("div", { class: "home-qm-desc" },
    "Answer a question. Claim the X. Own the pitch.",
  ));
  qm.appendChild(h("button", {
    class: "home-qm-btn", type: "button",
    onclick: () => { state.opponent = null; go("trivia"); },
  }, "Start Match →"));
  wrap.appendChild(qm);

  // ── 2-column grid ────────────────────────────────────────────────
  const grid = h("div", { class: "home-grid" });

  const gridCard = ({ icon, title, desc, onClick }) => {
    const card = h("div", { class: "home-gc", onclick: onClick });
    card.appendChild(h("div", { class: "home-gc-icon" },
      Icon({ name: icon, size: 24, color: "var(--flood-500)" }),
    ));
    card.appendChild(h("div", { class: "home-gc-title" }, title));
    card.appendChild(h("div", { class: "home-gc-desc"  }, desc));
    return card;
  };

  grid.appendChild(gridCard({ icon: "swords", title: "Friends",  desc: "Challenge a player",  onClick: () => go("friends") }));
  grid.appendChild(gridCard({ icon: "trophy", title: "Leagues",  desc: "2 of 4 unlocked",     onClick: () => go("levels")  }));

  wrap.appendChild(grid);
  return wrap;
};

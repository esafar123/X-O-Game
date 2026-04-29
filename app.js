// Pitch X&O — vanilla JS implementation of the design system.
// Single-page mobile web app with router, screens, and a real X&O AI opponent.

(() => {
  "use strict";

  // ────────────────────────────────────────────────────────────────
  // Supabase
  // ────────────────────────────────────────────────────────────────
  const db = window.supabase.createClient(
    "https://rhkycxduurrshgwfembn.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoa3ljeGR1dXJyc2hnd2ZlbWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjkyMDIsImV4cCI6MjA5MzA0NTIwMn0.Tu0TrserGiUrQA8gvWomIM99z0YnTFzTAw-TVYnF8wk"
  );

  function generateFriendCode(nickname) {
    const slug = nickname.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "PLAY";
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    return `XO-${slug}-${digits}`;
  }

  // ────────────────────────────────────────────────────────────────
  // DOM helpers
  // ────────────────────────────────────────────────────────────────
  const h = (tag, attrs = {}, ...kids) => {
    const el = tag.includes(":")
      ? document.createElementNS("http://www.w3.org/2000/svg", tag.split(":")[1])
      : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k in el && typeof el[k] !== "function" && tag !== "svg" && !tag.startsWith("svg:")) {
        try { el[k] = v; } catch { el.setAttribute(k, v); }
      } else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return el;
  };
  const svg = (attrs, ...kids) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
    for (const kid of kids.flat(Infinity)) if (kid) el.appendChild(kid);
    return el;
  };
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  // ────────────────────────────────────────────────────────────────
  // Icons (Lucide-style, 2px stroke)
  // ────────────────────────────────────────────────────────────────
  const ICON_PATHS = {
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

  function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2 }) {
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

  // X / O marks
  function XMark({ size = 60, glow = false } = {}) {
    const s = svg({ width: size, height: size, viewBox: "0 0 100 100", fill: "none" });
    if (glow) s.style.filter = "drop-shadow(0 0 12px rgba(255,255,255,0.6))";
    s.appendChild(svgEl("path", {
      d: "M22 22 L78 78 M78 22 L22 78",
      stroke: "#ffffff", "stroke-width": "11", "stroke-linecap": "round",
    }));
    return s;
  }
  function OMark({ size = 60, glow = false } = {}) {
    const s = svg({ width: size, height: size, viewBox: "0 0 100 100", fill: "none" });
    if (glow) s.style.filter = "drop-shadow(0 0 12px rgba(0,229,255,0.6))";
    s.appendChild(svgEl("circle", {
      cx: "50", cy: "50", r: "28", stroke: "#00e5ff", "stroke-width": "11",
    }));
    return s;
  }

  // Logo (combined wordmark mark)
  function Logo({ size = 80 } = {}) {
    const s = svg({ width: size, height: size, viewBox: "0 0 64 64", fill: "none" });
    s.appendChild(svgEl("circle", { cx: 32, cy: 32, r: 29, stroke: "#d4ff00", "stroke-width": 3 }));
    s.appendChild(svgEl("path", {
      d: "M18 18 L46 46 M46 18 L18 46",
      stroke: "#ffffff", "stroke-width": 5.5, "stroke-linecap": "round",
    }));
    s.appendChild(svgEl("circle", { cx: 32, cy: 32, r: 12, stroke: "#00e5ff", "stroke-width": 3.5 }));
    return s;
  }

  // ────────────────────────────────────────────────────────────────
  // Components
  // ────────────────────────────────────────────────────────────────
  function PitchButton({ label, variant = "primary", full = false, icon, iconRight, disabled = false, onClick }) {
    const cls = ["pbtn", variant, full ? "full" : ""].filter(Boolean).join(" ");
    const btn = h("button", { class: cls, disabled, onclick: disabled ? null : onClick, type: "button" });
    if (icon) btn.appendChild(Icon({ name: icon, size: 16 }));
    btn.appendChild(document.createTextNode(label));
    if (iconRight) btn.appendChild(Icon({ name: iconRight, size: 16 }));
    return btn;
  }

  function IconBtn({ name, color, onClick, ariaLabel }) {
    const b = h("button", {
      class: "icon-btn", type: "button", onclick: onClick,
      "aria-label": ariaLabel || name,
    }, Icon({ name, size: 18, color: color || "var(--fg-1)" }));
    return b;
  }

  function Avatar({ initial = "?", size = 44, team, status }) {
    const cls = ["avatar", team ? `team-${team}` : ""].filter(Boolean).join(" ");
    const el = h("div", {
      class: cls,
      style: { width: size + "px", height: size + "px", fontSize: (size * 0.4) + "px" },
    }, initial);
    if (status) el.appendChild(h("span", { class: `status ${status}` }));
    return el;
  }

  function Badge({ label, tone = "default" }) {
    return h("span", { class: `badge ${tone}` }, label);
  }

  function TopBar({ title, subtitle, leading, trailing }) {
    return h("div", { class: "topbar" },
      h("div", { class: "slot" }, leading),
      h("div", { class: "titles" },
        h("div", { class: "title" }, title),
        subtitle ? h("div", { class: "subtitle" }, subtitle) : null,
      ),
      h("div", { class: "slot right" }, trailing),
    );
  }

  function TimerRing({ value, total = 15, size = 84, danger = false, label }) {
    const r = 36;
    const C = 2 * Math.PI * r;
    const offset = C * (1 - value / total);
    const color = danger ? "var(--eliminate)" : "var(--flood-500)";
    const glow = danger ? "rgba(255,46,77,0.6)" : "rgba(212,255,0,0.6)";
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

  // ────────────────────────────────────────────────────────────────
  // App state
  // ────────────────────────────────────────────────────────────────
  const FRIENDS = [
    { id: 1, nm: "Marcus_77",   init: "M", status: "online",  meta: "Online · Champions",   stats: "12W · 3L",  team: "x" },
    { id: 2, nm: "Anya.B",      init: "A", status: "busy",    meta: "In match · 2:14",      stats: "8W · 4L",   team: "o" },
    { id: 3, nm: "Kai_GG",      init: "K", status: "offline", meta: "Last seen 2h ago",     stats: "15W · 9L" },
    { id: 4, nm: "Rho.Striker", init: "R", status: "online",  meta: "Online · Pro Pitch",   stats: "21W · 7L" },
    { id: 5, nm: "TomTom",      init: "T", status: "offline", meta: "Last seen yesterday",  stats: "4W · 11L" },
    { id: 6, nm: "Jules99",     init: "J", status: "online",  meta: "Online · Sunday",      stats: "9W · 2L" },
  ];

  const LEAGUES = [
    { id: 1, name: "Sunday League", desc: "Casual · 15s clock · Easy AI",  stars: 3, total: 3, unlocked: true,  progress: 100, difficulty: "easy",   clock: 15 },
    { id: 2, name: "Pro Pitch",     desc: "10s clock · Smart AI",          stars: 2, total: 3, unlocked: true,  progress: 60,  difficulty: "smart",  clock: 10 },
    { id: 3, name: "All-Star",      desc: "7s clock · Aggressive AI",      stars: 0, total: 3, unlocked: false, progress: 0,   difficulty: "hard",   clock: 7,  lockMsg: "Win 3 in Pro Pitch to unlock." },
    { id: 4, name: "Champions",     desc: "5s clock · Ruthless AI",        stars: 0, total: 3, unlocked: false, progress: 0,   difficulty: "ruthless", clock: 5, lockMsg: "Reach All-Star tier to unlock." },
  ];

  const LB_DATA = {
    global: [
      { rk: 1,   nm: "Rho.Striker", init: "R", w: 218, win: 81 },
      { rk: 2,   nm: "Anya.B",      init: "A", w: 204, win: 78 },
      { rk: 3,   nm: "Marcus_77",   init: "M", w: 197, win: 76 },
      { rk: 4,   nm: "Jules99",     init: "J", w: 189, win: 73 },
      { rk: 5,   nm: "Kai_GG",      init: "K", w: 180, win: 71 },
      { rk: 214, nm: "You",         init: "Y", w:  16, win: 75, you: true },
    ],
    friends: [
      { rk: 1, nm: "Marcus_77", init: "M", w: 197, win: 76 },
      { rk: 2, nm: "Jules99",   init: "J", w: 189, win: 73 },
      { rk: 3, nm: "Kai_GG",   init: "K", w: 180, win: 71 },
      { rk: 4, nm: "You",      init: "Y", w:  16, win: 75, you: true },
    ],
    weekly: [
      { rk: 1,  nm: "Anya.B",      init: "A", w: 42, win: 84 },
      { rk: 2,  nm: "Rho.Striker", init: "R", w: 38, win: 79 },
      { rk: 3,  nm: "Jules99",     init: "J", w: 31, win: 72 },
      { rk: 4,  nm: "Marcus_77",   init: "M", w: 27, win: 68 },
      { rk: 5,  nm: "Kai_GG",      init: "K", w: 19, win: 61 },
      { rk: 11, nm: "You",         init: "Y", w:  4, win: 75, you: true },
    ],
  };
  const LB_TOP = LB_DATA.global;

  const storedProfile = JSON.parse(localStorage.getItem("xo_profile") || "null");

  const joinCode = new URLSearchParams(window.location.search).get("join") || null;

  const state = {
    screen: "splash",
    profile: storedProfile,
    joinCode,
    onboarding: { nickname: "", gender: "" },
    opponent: null,
    league: LEAGUES[1],          // default to Pro Pitch
    sound: true,
    haptics: true,
    team: "x",                   // user's mark
    score: { x: 0, o: 0 },
    lastResult: null,
    lastMatchLengthSec: 0,
    settings: { soundOn: true, hapticsOn: true },
    leaderboardTab: "global",
    matchChannel: null,   // Supabase Realtime channel for live 1v1
    playerRole:   null,   // "host" | "guest"
  };

  // ────────────────────────────────────────────────────────────────
  // Router
  // ────────────────────────────────────────────────────────────────
  let unmounters = [];
  const cleanup = () => { unmounters.forEach(fn => { try { fn(); } catch {} }); unmounters = []; };
  const onUnmount = (fn) => unmounters.push(fn);

  function go(screen, opts = {}) {
    cleanup();
    state.screen = screen;
    if ("opponent" in opts) state.opponent = opts.opponent;
    if ("result"   in opts) state.lastResult = opts.result;
    if ("league"   in opts) state.league = opts.league;
    render();
  }

  function render() {
    const root = document.getElementById("root");
    root.innerHTML = "";
    const screen = SCREENS[state.screen] || SCREENS.home;
    root.appendChild(screen());
  }

  // ────────────────────────────────────────────────────────────────
  // Game logic
  // ────────────────────────────────────────────────────────────────
  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];

  function checkWin(b) {
    for (const [a,c,d] of LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a,c,d] };
    }
    if (b.every(Boolean)) return { who: "draw", line: [] };
    return null;
  }

  // Minimax for the AI opponent
  function minimax(b, ai, human, current) {
    const r = checkWin(b);
    if (r) {
      if (r.who === ai) return { score: 10 };
      if (r.who === human) return { score: -10 };
      return { score: 0 };
    }
    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = current;
      const next = minimax(b, ai, human, current === ai ? human : ai);
      moves.push({ i, score: next.score });
      b[i] = null;
    }
    if (current === ai) {
      let best = moves[0];
      for (const m of moves) if (m.score > best.score) best = m;
      return best;
    } else {
      let best = moves[0];
      for (const m of moves) if (m.score < best.score) best = m;
      return best;
    }
  }

  function aiMove(board, ai, human, difficulty) {
    const empty = board.map((c, i) => c ? null : i).filter(i => i !== null);
    if (!empty.length) return null;

    // Difficulty controls how often the AI plays optimally vs randomly.
    const optimalProb = { easy: 0.25, smart: 0.65, hard: 0.85, ruthless: 1.0 }[difficulty] ?? 0.7;
    if (Math.random() > optimalProb) {
      return empty[Math.floor(Math.random() * empty.length)];
    }
    const move = minimax([...board], ai, human, ai);
    return move.i ?? empty[0];
  }

  // ────────────────────────────────────────────────────────────────
  // Screens
  // ────────────────────────────────────────────────────────────────
  const SCREENS = {};

  // ── SPLASH ──
  SCREENS.splash = () => {
    const wrap = h("div", { class: "screen-scroll pitch-bg-app splash" });
    const hero = h("div", { class: "hero" });
    hero.appendChild(Logo({ size: 108 }));
    hero.appendChild(h("div", { class: "wordmark" },
      "PITCH", h("br"),
      h("span", { class: "accent" }, "X", h("span", { class: "dot" }, "·"), "O"),
    ));
    hero.appendChild(h("div", { class: "tagline" }, "The floodlit night-game"));
    wrap.appendChild(hero);
    const actions = h("div", { class: "actions" });
    actions.appendChild(PitchButton({ label: "READY UP", variant: "primary", full: true, iconRight: "forward", onClick: () => go(state.profile ? "home" : "onboarding") }));
    actions.appendChild(PitchButton({ label: "Continue as guest", variant: "ghost", full: true, onClick: () => go("home") }));
    actions.appendChild(h("div", { class: "ver" }, "v 1.0 · Pre-season"));
    wrap.appendChild(actions);
    return wrap;
  };

  // ── JOIN VIA QR ──
  SCREENS.join = () => {
    const code        = state.joinCode || "";
    const inviterName = code.replace(/^XO-/, "").replace(/-\d+$/, "");
    const wrap        = h("div", { class: "screen-scroll pitch-bg-app splash" });

    const hero = h("div", { class: "hero" });
    hero.appendChild(Logo({ size: 80 }));
    hero.appendChild(h("div", { class: "wordmark" },
      h("span", { style: { fontSize: "18px", letterSpacing: "0.12em" } }, inviterName),
      h("br"),
      h("span", { class: "accent", style: { fontSize: "28px" } }, "INVITED YOU"),
    ));
    hero.appendChild(h("div", { class: "tagline" }, `Code: ${code}`));
    wrap.appendChild(hero);

    const statusMsg = h("div", { class: "join-status" });
    const actions   = h("div", { class: "actions" });

    actions.appendChild(PitchButton({
      label: "Accept & Play", variant: "primary", full: true, iconRight: "forward",
      onClick: () => {
        // Auto-create a guest profile if the scanner hasn't registered yet
        if (!state.profile) {
          const POOL = ["Shadow_GK","Night_Striker","Ghost_Winger","Phantom_CF","Dark_Keeper"];
          const nickname    = POOL[Math.floor(Math.random() * POOL.length)];
          const friend_code = generateFriendCode(nickname);
          const profile     = { nickname, gender: "guest", friend_code, is_guest: true };
          localStorage.setItem("xo_profile", JSON.stringify(profile));
          state.profile = profile;
        }
        const myName = state.profile.nickname;
        state.opponent   = { nm: inviterName, init: inviterName[0]?.toUpperCase() || "?", status: "online", meta: "Via QR invite", stats: "" };
        state.playerRole = "guest";

        statusMsg.textContent = "Connecting…";
        statusMsg.style.color = "var(--flood-500)";

        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          statusMsg.textContent = "No response — is the host still on the waiting screen?";
          statusMsg.style.color = "var(--eliminate)";
        }, 12000);

        // Subscribe to the shared channel and announce arrival
        const ch = db.channel(`match:${code}`)
          .on("broadcast", { event: "host_ack" }, () => {
            if (timedOut) return;
            clearTimeout(timeout);
            state.matchChannel = ch;
            state.score = { x: 0, o: 0 };
            go("board_mp");
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await ch.send({
                type: "broadcast", event: "guest_joined",
                payload: { nickname: myName },
              });
            }
          });
      },
    }));

    actions.appendChild(statusMsg);
    actions.appendChild(PitchButton({ label: "Continue as guest", variant: "ghost", full: true, onClick: () => go("home") }));
    wrap.appendChild(actions);
    return wrap;
  };

  // ── ONBOARDING ──
  SCREENS.onboarding = () => {
    const wrap = h("div", { class: "screen-scroll" });
    wrap.appendChild(TopBar({ title: "Create Profile", subtitle: "One-time setup" }));

    const initial = state.onboarding.nickname ? state.onboarding.nickname[0].toUpperCase() : "?";
    wrap.appendChild(h("div", { class: "onb-avatar-wrap" },
      Avatar({ initial, size: 72 }),
    ));

    const input = h("input", {
      class: "onb-input", type: "text",
      placeholder: "Your nickname…", maxlength: "16",
      value: state.onboarding.nickname,
    });
    input.addEventListener("input", () => { state.onboarding.nickname = input.value; });
    wrap.appendChild(h("div", { class: "onb-field" },
      h("div", { class: "section-label" }, "Nickname"),
      input,
    ));

    wrap.appendChild(h("div", { class: "onb-field" },
      h("div", { class: "section-label" }, "You play as"),
      h("div", { class: "onb-gender-row" },
        ...["Male", "Female"].map(g => {
          const sel = state.onboarding.gender === g.toLowerCase();
          const btn = h("button", {
            class: `onb-gender-btn ${sel ? "sel" : ""}`,
            type: "button",
            onclick: () => { state.onboarding.gender = g.toLowerCase(); render(); },
          });
          btn.appendChild(Icon({ name: g.toLowerCase(), size: 30, color: "currentColor" }));
          btn.appendChild(h("span", { class: "onb-gender-label" }, g));
          return btn;
        }),
      ),
    ));

    const ready = state.onboarding.nickname.trim().length >= 2 && state.onboarding.gender;
    wrap.appendChild(h("div", { class: "onb-actions" },
      PitchButton({
        label: "Create Profile", variant: "primary", full: true, iconRight: "forward",
        disabled: !ready,
        onClick: () => {
          const nickname = state.onboarding.nickname.trim();
          const gender   = state.onboarding.gender;
          const friend_code = generateFriendCode(nickname);
          const profile = { nickname, gender, friend_code };
          localStorage.setItem("xo_profile", JSON.stringify(profile));
          state.profile = profile;
          go("code_reveal");
          db.from("profiles").insert(profile).select().single().then(({ data }) => {
            if (data?.id) {
              profile.id = data.id;
              localStorage.setItem("xo_profile", JSON.stringify(profile));
            }
          });
        },
      }),
    ));

    wrap.appendChild(h("div", { class: "onb-guest-wrap" },
      h("span", { class: "onb-guest-or" }, "or"),
      h("button", {
        class: "onb-guest-btn", type: "button",
        onclick: () => {
          const GUEST_POOL = [
            "Shadow_GK", "Night_Striker", "Ghost_Winger", "Phantom_CF",
            "Dark_Keeper", "Storm_Back",   "Ice_Fwd",      "Fire_Mid",
            "Blaze_Sub",  "Dusk_Libero",
          ];
          const nickname    = GUEST_POOL[Math.floor(Math.random() * GUEST_POOL.length)];
          const friend_code = generateFriendCode(nickname);
          const profile     = { nickname, gender: "guest", friend_code, is_guest: true };
          localStorage.setItem("xo_profile", JSON.stringify(profile));
          state.profile = profile;
          go("home");
        },
      }, "Continue as Guest"),
    ));

    return wrap;
  };

  // ── CODE REVEAL ──
  SCREENS.code_reveal = () => {
    const wrap = h("div", { class: "screen-scroll pitch-bg-app" });
    wrap.appendChild(TopBar({ title: "Your Pitch Code" }));

    const code    = state.profile?.friend_code || "";
    const gameUrl = `https://x-o-game-five-jade.vercel.app/?join=${encodeURIComponent(code)}`;
    const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(gameUrl)}&bgcolor=050a08&color=d4ff00`;

    const card = h("div", { class: "code-card" });
    card.appendChild(h("img", { class: "code-qr", src: qrUrl, alt: "QR for " + code, width: 220, height: 220 }));
    card.appendChild(h("div", { class: "code-value" }, code));

    const copyBtn = h("button", { class: "pbtn ghost code-copy-btn", type: "button",
      onclick: () => {
        navigator.clipboard?.writeText(code).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => { copyBtn.textContent = "Copy Code"; }, 2000);
        });
      },
    }, "Copy Code");
    card.appendChild(copyBtn);
    wrap.appendChild(card);

    wrap.appendChild(h("p", { class: "code-tip" },
      "Ask a friend to scan this QR — it drops them straight into a match with you.",
    ));

    wrap.appendChild(h("div", { class: "onb-actions" },
      PitchButton({ label: "Wait for Friend to Scan", variant: "primary", full: true, icon: "clock", onClick: () => go("lobby") }),
    ));
    wrap.appendChild(h("div", { style: { padding: "0 20px 24px" } },
      PitchButton({ label: "Start Playing Solo", variant: "ghost", full: true, onClick: () => go("home") }),
    ));

    return wrap;
  };

  // ── LOBBY (QR creator waits for friend to scan) ──
  SCREENS.lobby = () => {
    const code   = state.profile?.friend_code || "";
    const myName = state.profile?.nickname    || "You";

    // Status element declared first so the async handler can update it
    const statusEl = h("div", { class: "tick" }, code);

    const cancelFn = () => {
      ch.unsubscribe();
      state.matchChannel = null;
      go("home");
    };

    // Open the Supabase Realtime channel immediately
    const ch = db.channel(`match:${code}`)
      .on("broadcast", { event: "guest_joined" }, ({ payload }) => {
        const guestName = payload.nickname || "Guest";
        state.opponent   = { nm: guestName, init: guestName[0]?.toUpperCase() || "?", status: "online", meta: "Via QR invite", stats: "" };
        state.playerRole = "host";
        state.matchChannel = ch;
        statusEl.textContent = `${guestName} accepted — starting…`;
        // Acknowledge so the guest navigates too
        ch.send({ type: "broadcast", event: "host_ack", payload: { hostNickname: myName } });
        setTimeout(() => { state.score = { x: 0, o: 0 }; go("board_mp"); }, 900);
      });
    ch.subscribe();

    const wrap = h("div", { class: "screen-scroll pitch-bg-app matchmaking" });
    wrap.appendChild(TopBar({
      title: "Waiting for Friend",
      leading: IconBtn({ name: "close", onClick: cancelFn }),
    }));

    const body = h("div", { class: "body" });
    const scanner = h("div", { class: "scanner" });
    const rings = svg({ viewBox: "0 0 180 180" });
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
    body.appendChild(h("div", { class: "head" }, "WAITING FOR FRIEND"));
    body.appendChild(statusEl);
    body.appendChild(h("div", { class: "desc" }, "Share your QR — the match starts the moment they accept."));
    wrap.appendChild(body);

    wrap.appendChild(h("div", { class: "footer" },
      PitchButton({ label: "Cancel", variant: "ghost", full: true, onClick: cancelFn }),
    ));

    return wrap;
  };

  // ── BOARD (Multiplayer 1v1 via Supabase Realtime) ──
  SCREENS.board_mp = () => {
    const channel  = state.matchChannel;
    const isHost   = state.playerRole === "host";
    const userMark = isHost ? "x" : "o";
    const oppMark  = isHost ? "o" : "x";
    const opp      = state.opponent || { nm: "Opponent" };

    let board  = Array(9).fill(null);
    let turn   = "x";   // X (host) always moves first
    let result = null;
    let elapsedSec = 0;
    const score = state.score;

    const wrap = h("div", { class: "screen-scroll pitch-bg-app board-screen" });
    wrap.appendChild(TopBar({
      title: "Live Match",
      subtitle: "Online · 1v1",
      leading: IconBtn({ name: "close", onClick: () => { state.score = { x: 0, o: 0 }; go("home"); } }),
      trailing: IconBtn({ name: "more" }),
    }));

    const strip  = h("div", { class: "player-strip" });
    let youCard  = PlayerCard({ team: userMark, name: "You",  score: score[userMark], active: turn === userMark });
    const midEl  = h("div", { style: { display: "flex", alignItems: "center", justifyContent: "center" } },
      Logo({ size: 46 }),
    );
    let oppCard  = PlayerCard({ team: oppMark,  name: opp.nm, score: score[oppMark],  active: turn === oppMark });
    strip.append(youCard, midEl, oppCard);
    wrap.appendChild(strip);

    const boardWrap = h("div", { class: "board-wrap" });
    const grid = h("div", { class: "board" });
    boardWrap.appendChild(grid);
    wrap.appendChild(boardWrap);

    const indicator = h("div", { class: "turn-indicator" });
    wrap.appendChild(indicator);

    const renderStrip = () => {
      const ny = PlayerCard({ team: userMark, name: "You",  score: score[userMark], active: turn === userMark && !result });
      const no = PlayerCard({ team: oppMark,  name: opp.nm, score: score[oppMark],  active: turn === oppMark  && !result });
      youCard.replaceWith(ny); youCard = ny;
      oppCard.replaceWith(no); oppCard = no;
    };
    const renderIndicator = () => {
      indicator.innerHTML = "";
      if (result) {
        const txt = result.who === "draw" ? "STALEMATE." : result.who === userMark ? "YOU WIN." : "FULL TIME.";
        indicator.appendChild(h("div", { class: "head result" }, txt));
      } else {
        indicator.appendChild(h("div", { class: `head ${turn}` },
          turn === userMark ? "YOUR MARK" : `${opp.nm.toUpperCase()} IS PLAYING`));
        indicator.appendChild(h("div", { class: "sub" },
          turn === userMark ? "Make it count." : "Waiting for opponent…"));
      }
    };
    const renderBoard = () => {
      grid.innerHTML = "";
      board.forEach((cell, i) => {
        const winning  = result?.line?.includes(i);
        const cls      = ["cell"];
        if (cell === "x") cls.push("has-x");
        if (cell === "o") cls.push("has-o");
        if (winning)      cls.push("win");
        const disabled = !!(cell || result || turn !== userMark);
        if (disabled) cls.push("disabled");
        const btn = h("button", { class: cls.join(" "), type: "button", disabled, onclick: () => userPlace(i) });
        if (cell === "x") btn.appendChild(XMark({ size: 56, glow: true }));
        if (cell === "o") btn.appendChild(OMark({ size: 56, glow: true }));
        grid.appendChild(btn);
      });
    };
    const renderAll = () => { renderStrip(); renderBoard(); renderIndicator(); };

    function place(i, mark) {
      if (board[i] || result) return;
      board[i] = mark;
      result = checkWin(board);
      if (result) {
        if (result.who === "x") score.x += 1;
        if (result.who === "o") score.o += 1;
      }
      turn = mark === "x" ? "o" : "x";
      renderAll();
      if (result) finishSoon();
    }

    function userPlace(i) {
      if (turn !== userMark || result || board[i]) return;
      place(i, userMark);
      if (channel) channel.send({ type: "broadcast", event: "move", payload: { index: i, mark: userMark } });
    }

    function finishSoon() {
      const t = setTimeout(() => {
        state.lastMatchLengthSec = elapsedSec;
        go("gameover", { result: { ...result, userMark } });
      }, 1100);
      onUnmount(() => clearTimeout(t));
    }

    // Elapsed time (cosmetic — for the gameover stats screen)
    const tick = setInterval(() => { elapsedSec += 1; }, 1000);
    onUnmount(() => clearInterval(tick));

    // Receive opponent moves
    if (channel) {
      channel.on("broadcast", { event: "move" }, ({ payload }) => {
        if (payload.mark !== userMark) place(payload.index, payload.mark);
      });
    }

    // Tear down channel when leaving this screen
    onUnmount(() => {
      if (state.matchChannel) {
        state.matchChannel.unsubscribe();
        state.matchChannel = null;
        state.playerRole   = null;
      }
    });

    renderAll();
    return wrap;
  };

  // ── HOME ──
  SCREENS.home = () => {
    const wrap = h("div", { class: "screen-scroll pitch-bg-app" });
    wrap.appendChild(TopBar({
      title: "Pitch XO",
      subtitle: "Pre-season · Week 3",
      leading: IconBtn({ name: "settings", onClick: () => go("settings") }),
      trailing: IconBtn({ name: "friends", onClick: () => go("friends") }),
    }));
    wrap.appendChild(h("div", { class: "streak-hero" },
      h("div", { style: { flex: 1 } },
        h("div", { class: "meta" }, "Current streak"),
        h("div", { class: "num" }, "5W"),
        h("div", { class: "desc" }, "One more win to crack the top 200."),
      ),
      h("div", { class: "bolt-orb" }, Icon({ name: "bolt", size: 40, color: "var(--flood-500)" })),
    ));
    const list = h("div", { class: "action-list" });
    list.appendChild(ActionTile({ title: "Quick match", desc: "Find an opponent · 15s clock", icon: "bolt", accent: true, onClick: () => { state.opponent = null; go("matchmaking"); }}));
    list.appendChild(ActionTile({ title: "Play a friend", desc: "3 friends online", icon: "swords", onClick: () => go("friends") }));
    list.appendChild(ActionTile({ title: "Leagues", desc: "2 of 4 unlocked", icon: "trophy", onClick: () => go("levels") }));
    list.appendChild(ActionTile({ title: "Leaderboard", desc: "You're ranked #214", icon: "star", onClick: () => go("leaderboard") }));
    wrap.appendChild(list);
    return wrap;
  };
  function ActionTile({ title, desc, icon, accent, onClick }) {
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

  // ── FRIENDS ──
  SCREENS.friends = () => {
    const wrap = h("div", { class: "screen-scroll" });
    wrap.appendChild(TopBar({
      title: "Roster",
      leading: IconBtn({ name: "back", onClick: () => go("home") }),
      trailing: IconBtn({ name: "plus" }),
    }));
    wrap.appendChild(h("div", { class: "row-gap-8" },
      Badge({ label: "3 online", tone: "flood" }),
      Badge({ label: "6 total", tone: "default" }),
    ));
    const list = h("div", { class: "list" });
    for (const f of FRIENDS) {
      const row = h("div", { class: `friend-row ${f.status === "offline" ? "offline" : ""}` },
        Avatar({ initial: f.init, size: 42, team: f.team, status: f.status }),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { class: "nm" }, f.nm),
          h("div", { class: "meta" }, f.meta),
        ),
        h("div", { class: "stats" }, f.stats),
        f.status === "online"
          ? h("button", { class: "friend-action challenge", type: "button", onclick: () => go("matchmaking", { opponent: f }) }, "Challenge")
          : f.status === "busy"
            ? h("button", { class: "friend-action watch", type: "button" }, "Watch")
            : h("button", { class: "friend-action invite", type: "button" }, "Invite"),
      );
      list.appendChild(row);
    }
    wrap.appendChild(list);
    return wrap;
  };

  // ── MATCHMAKING ──
  SCREENS.matchmaking = () => {
    const wrap = h("div", { class: "screen-scroll pitch-bg-app matchmaking" });
    wrap.appendChild(TopBar({
      title: "Finding match",
      leading: IconBtn({ name: "close", onClick: () => go("home") }),
    }));
    const body = h("div", { class: "body" });
    const scanner = h("div", { class: "scanner" });
    const rings = svg({ viewBox: "0 0 180 180" });
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

    const footer = h("div", { class: "footer" },
      PitchButton({ label: "Cancel", variant: "ghost", full: true, onClick: () => go("home") }),
    );
    wrap.appendChild(footer);

    // Tick + auto-advance
    let t = 0;
    const interval = setInterval(() => {
      t += 1;
      if (!state.opponent) tickEl.textContent = `Searching · ${t}s`;
    }, 1000);
    const timeout = setTimeout(() => {
      // Pick an opponent if quick-match
      if (!state.opponent) {
        const online = FRIENDS.filter(f => f.status === "online");
        state.opponent = online[Math.floor(Math.random() * online.length)] || FRIENDS[0];
      }
      go("board");
    }, 3500);
    onUnmount(() => { clearInterval(interval); clearTimeout(timeout); });
    return wrap;
  };

  // ── LEAGUES ──
  SCREENS.levels = () => {
    const wrap = h("div", { class: "screen-scroll" });
    wrap.appendChild(TopBar({
      title: "Leagues",
      leading: IconBtn({ name: "back", onClick: () => go("home") }),
      trailing: IconBtn({ name: "more" }),
    }));
    const head = h("div", { class: "leagues-head" },
      h("div", { class: "title" }, "PRO ", h("span", { class: "accent" }, "PITCH")),
      h("div", { class: "meta" }, "Currently in this tier · 6/10 wins"),
      h("div", { class: "bar" }, h("span", { style: { width: "60%" } })),
    );
    wrap.appendChild(head);

    const list = h("div", { class: "list", style: { gap: "12px", marginTop: "8px" } });
    for (const L of LEAGUES) list.appendChild(LeagueCard(L));
    wrap.appendChild(list);
    return wrap;
  };

  function LeagueCard(L) {
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
          onclick: () => go("matchmaking", { league: L }),
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

  // ── BOARD (real game) ──
  SCREENS.board = () => {
    const userMark = state.team;            // "x" or "o"
    const aiMark   = userMark === "x" ? "o" : "x";
    const opp      = state.opponent || { nm: "Marcus_77" };
    const league   = state.league || LEAGUES[1];

    let board = Array(9).fill(null);
    let turn  = "x";                         // X always starts (home team)
    let result = null;
    let time = league.clock;
    const score = state.score;
    let elapsedSec = 0;

    const wrap = h("div", { class: "screen-scroll pitch-bg-app board-screen" });
    const top = TopBar({
      title: "Live Match",
      subtitle: `${league.name} · Round ${score.x + score.o + 1}`,
      leading: IconBtn({ name: "close", onClick: () => go("home") }),
      trailing: IconBtn({ name: "more" }),
    });
    wrap.appendChild(top);

    const strip = h("div", { class: "player-strip" });
    const youCard   = PlayerCard({ team: userMark, name: "You", score: score[userMark], active: turn === userMark });
    const ringSlot  = h("div");
    const oppCard   = PlayerCard({ team: aiMark, name: opp.nm, score: score[aiMark], active: turn === aiMark });
    strip.append(youCard, ringSlot, oppCard);
    wrap.appendChild(strip);

    const boardWrap = h("div", { class: "board-wrap" });
    const grid = h("div", { class: "board" });
    boardWrap.appendChild(grid);
    wrap.appendChild(boardWrap);

    const indicator = h("div", { class: "turn-indicator" });
    wrap.appendChild(indicator);

    const renderRing = () => {
      ringSlot.innerHTML = "";
      ringSlot.appendChild(TimerRing({
        value: time, total: league.clock, size: 84,
        danger: time <= Math.ceil(league.clock / 3),
        label: turn === userMark ? "your move" : "their move",
      }));
    };
    const renderStrip = () => {
      youCard.replaceWith(refreshPlayerCard(youCard, { team: userMark, name: "You", score: score[userMark], active: turn === userMark && !result }));
      oppCard.replaceWith(refreshPlayerCard(oppCard, { team: aiMark,  name: opp.nm, score: score[aiMark], active: turn === aiMark && !result }));
    };
    const renderIndicator = () => {
      indicator.innerHTML = "";
      if (result) {
        let txt;
        if (result.who === "draw") txt = "STALEMATE.";
        else if (result.who === userMark) txt = "YOU WIN.";
        else txt = "FULL TIME.";
        indicator.appendChild(h("div", { class: "head result" }, txt));
      } else {
        const headCls = turn === userMark ? userMark : aiMark;
        const headText = turn === userMark ? "YOUR MARK" : `${(opp.nm || "MARCUS").toUpperCase()} IS THINKING`;
        indicator.appendChild(h("div", { class: `head ${headCls}` }, headText));
        indicator.appendChild(h("div", { class: "sub" },
          turn === userMark ? "Make it count." : "Hold the line."));
      }
    };
    const renderBoard = () => {
      grid.innerHTML = "";
      board.forEach((cell, i) => {
        const winning = result?.line?.includes(i);
        const cls = ["cell"];
        if (cell === "x") cls.push("has-x");
        if (cell === "o") cls.push("has-o");
        if (winning)      cls.push("win");
        const isDisabled = !!(cell || result || turn !== userMark);
        if (isDisabled) cls.push("disabled");
        const btn = h("button", {
          class: cls.join(" "), type: "button",
          disabled: isDisabled,
          onclick: () => userPlace(i),
        });
        if (cell === "x") btn.appendChild(XMark({ size: 56, glow: true }));
        if (cell === "o") btn.appendChild(OMark({ size: 56, glow: true }));
        grid.appendChild(btn);
      });
    };

    const renderAll = () => { renderStrip(); renderRing(); renderBoard(); renderIndicator(); };

    function place(i, mark) {
      if (board[i] || result) return false;
      board[i] = mark;
      result = checkWin(board);
      if (result) {
        if (result.who === "x") score.x += 1;
        if (result.who === "o") score.o += 1;
      }
      turn = mark === "x" ? "o" : "x";
      time = league.clock;
      renderAll();
      if (result) finishSoon();
      else if (turn === aiMark) scheduleAi();
      return true;
    }

    function userPlace(i) {
      if (turn !== userMark || result) return;
      place(i, userMark);
    }

    let aiTimer = null;
    function scheduleAi() {
      if (aiTimer) clearTimeout(aiTimer);
      const delay = 600 + Math.random() * 800;
      aiTimer = setTimeout(() => {
        const i = aiMove(board, aiMark, userMark, league.difficulty);
        if (i != null) place(i, aiMark);
      }, delay);
    }

    function finishSoon() {
      const t = setTimeout(() => {
        state.lastMatchLengthSec = elapsedSec;
        go("gameover", { result: { ...result, userMark } });
      }, 1100);
      onUnmount(() => clearTimeout(t));
    }

    // Per-second tick
    const tick = setInterval(() => {
      elapsedSec += 1;
      if (result) return;
      time = Math.max(0, time - 1);
      renderRing();
      if (time === 0) {
        // time-out — current player loses their turn
        if (turn === userMark) {
          turn = aiMark; time = league.clock; renderAll(); scheduleAi();
        } else {
          turn = userMark; time = league.clock; renderAll();
        }
      }
    }, 1000);

    onUnmount(() => { clearInterval(tick); if (aiTimer) clearTimeout(aiTimer); });

    renderAll();
    if (turn === aiMark) scheduleAi();
    return wrap;
  };

  function PlayerCard({ team, name, score, active }) {
    const cls = ["player-card", team, active ? "active" : ""].filter(Boolean).join(" ");
    const card = h("div", { class: cls });
    card.appendChild(h("div", { class: "head" },
      h("div", { class: "badge-mark" }, team === "x" ? XMark({ size: 16 }) : OMark({ size: 16 })),
      h("div", { class: "nm" }, name),
    ));
    card.appendChild(h("div", { class: "score-num" }, String(score)));
    return card;
  }
  function refreshPlayerCard(oldEl, props) {
    const next = PlayerCard(props);
    oldEl.replaceWith(next);
    return next;
  }

  // ── GAME OVER ──
  SCREENS.gameover = () => {
    const r = state.lastResult || { who: "draw", line: [], userMark: state.team };
    const youWon = r.who === r.userMark;
    const draw = r.who === "draw";
    const headline = draw ? "STALEMATE." : youWon ? "FULL TIME — YOU WIN" : "FULL TIME";
    const opp = state.opponent || { nm: "Marcus" };
    const sub = draw
      ? "Run it back?"
      : youWon
        ? "Clean sheet. Pitch is yours."
        : `${opp.nm} took it ${state.score.o}-${state.score.x}.`;

    const wrap = h("div", { class: "screen-scroll pitch-bg-app gameover" });
    wrap.appendChild(TopBar({
      title: "Full time",
      leading: IconBtn({ name: "home", onClick: () => go("home") }),
    }));
    const body = h("div", { class: "body" });
    const orb = h("div", { class: `icon-orb ${youWon ? "win" : "loss"}` });
    if (youWon) orb.appendChild(Icon({ name: "trophy", size: 56, color: "var(--flood-500)" }));
    else if (draw) {
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

    const fmtTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
    body.appendChild(h("div", { class: "summary" },
      Stat("X-mark", String(state.score.x), "var(--x-chalk)"),
      Stat("O-mark", String(state.score.o), "var(--o-cyan)"),
      Stat("Length", fmtTime(state.lastMatchLengthSec || 74), "var(--flood-500)"),
      Stat("XP", youWon ? "+34" : "+8", "var(--fg-1)"),
    ));
    wrap.appendChild(body);

    wrap.appendChild(h("div", { class: "footer" },
      PitchButton({ label: "Run it back", variant: "primary", full: true, icon: "rematch", onClick: () => { state.score = { x: 0, o: 0 }; go("matchmaking"); } }),
      PitchButton({ label: "Back to home", variant: "ghost", full: true, onClick: () => { state.score = { x: 0, o: 0 }; go("home"); } }),
    ));
    return wrap;
  };
  function Stat(lbl, val, color) {
    return h("div", { class: "stat" },
      h("div", { class: "lbl" }, lbl),
      h("div", { class: "val", style: { color } }, val),
    );
  }

  // ── LEADERBOARD ──
  SCREENS.leaderboard = () => {
    const wrap = h("div", { class: "screen-scroll" });
    wrap.appendChild(TopBar({
      title: "Leaderboard",
      leading: IconBtn({ name: "back", onClick: () => go("home") }),
    }));
    const tabs = h("div", { class: "tabs" });
    for (const k of ["global", "friends", "weekly"]) {
      tabs.appendChild(h("button", {
        class: `tab ${state.leaderboardTab === k ? "active" : ""}`,
        type: "button",
        onclick: () => { state.leaderboardTab = k; render(); },
      }, k));
    }
    wrap.appendChild(tabs);

    const rows = LB_DATA[state.leaderboardTab] || LB_DATA.global;
    const top3 = rows.slice(0, 3);
    const rest = rows.slice(3);

    if (top3.length === 3) {
      const podium = h("div", { class: "podium" });
      const byRk = (rk) => top3.find(p => p.rk === rk) || top3[rk - 1];
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
          h("div", { class: "nm" }, p.nm),
          h("div", { class: "winrate" }, p.win + "% win"),
        ),
        h("div", { class: "pts" }, String(p.w)),
      ));
    }
    wrap.appendChild(list);
    return wrap;
  };
  function PodiumCol({ rk, nm, init, pts, h: ht, top }) {
    const col = h("div", { class: `podium-col ${top ? "top" : ""}` });
    const av = Avatar({ initial: init, size: top ? 54 : 42 });
    if (top) {
      av.style.boxShadow = "var(--glow-flood)";
      av.style.border = "2px solid var(--flood-500)";
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

  // ── SETTINGS ──
  SCREENS.settings = () => {
    const wrap = h("div", { class: "screen-scroll" });
    wrap.appendChild(TopBar({
      title: "Settings",
      leading: IconBtn({ name: "back", onClick: () => go("home") }),
    }));
    wrap.appendChild(h("div", { style: { padding: "0 20px 8px" } },
      h("div", { class: "profile-card" },
        Avatar({ initial: state.profile ? state.profile.nickname[0].toUpperCase() : "Y", size: 56, team: "x", status: "online" }),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { class: "nm" }, state.profile?.nickname || "You_pitch"),
          h("div", { class: "meta" }, "Pro Pitch · #214"),
        ),
        Icon({ name: "forward", size: 18, color: "var(--fg-3)" }),
      ),
    ));

    wrap.appendChild(h("div", { class: "section-label" }, "Game"));
    wrap.appendChild(h("div", { class: "setting-group" },
      SettingRow("Sound effects", Toggle(state.sound, () => { state.sound = !state.sound; render(); })),
      SettingRow("Haptics",       Toggle(state.haptics, () => { state.haptics = !state.haptics; render(); })),
      SettingRow("Default team",  TeamPicker(state.team, (t) => { state.team = t; render(); })),
    ));

    wrap.appendChild(h("div", { class: "section-label" }, "Account"));
    wrap.appendChild(h("div", { class: "setting-group" },
      SettingRow("Friend code", h("span", { class: "friend-code" }, state.profile?.friend_code || "—")),
      SettingRow("Privacy",      Icon({ name: "forward", size: 16, color: "var(--fg-3)" })),
      SettingRow("Notifications",Icon({ name: "forward", size: 16, color: "var(--fg-3)" })),
    ));

    wrap.appendChild(h("div", { style: { padding: "20px" } },
      PitchButton({ label: "Sign out", variant: "ghost", full: true, onClick: () => {
        localStorage.removeItem("xo_profile");
        state.profile = null;
        state.onboarding = { nickname: "", gender: "" };
        go("splash");
      }}),
    ));

    return wrap;
  };
  function SettingRow(label, right) {
    return h("div", { class: "setting-row" },
      h("span", { class: "label" }, label),
      right,
    );
  }
  function Toggle(on, onChange) {
    return h("button", { class: `toggle ${on ? "on" : ""}`, type: "button", onclick: onChange, "aria-pressed": String(!!on) });
  }
  function TeamPicker(value, onChange) {
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

  // ────────────────────────────────────────────────────────────────
  // Boot
  // ────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    if (state.joinCode) state.screen = "join";
    render();
  });
})();

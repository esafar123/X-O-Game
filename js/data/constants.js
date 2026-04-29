// Static data — friends list, leagues, leaderboard, trivia difficulty map

export const FRIENDS = [
  { id: 1, nm: "Marcus_77",   init: "M", status: "online",  meta: "Online · Champions",   stats: "12W · 3L",  team: "x" },
  { id: 2, nm: "Anya.B",      init: "A", status: "busy",    meta: "In match · 2:14",      stats: "8W · 4L",   team: "o" },
  { id: 3, nm: "Kai_GG",      init: "K", status: "offline", meta: "Last seen 2h ago",     stats: "15W · 9L" },
  { id: 4, nm: "Rho.Striker", init: "R", status: "online",  meta: "Online · Pro Pitch",   stats: "21W · 7L" },
  { id: 5, nm: "TomTom",      init: "T", status: "offline", meta: "Last seen yesterday",  stats: "4W · 11L" },
  { id: 6, nm: "Jules99",     init: "J", status: "online",  meta: "Online · Sunday",      stats: "9W · 2L" },
];

export const LEAGUES = [
  { id: 1, name: "Sunday League", desc: "Casual · 15s clock · Easy AI",  stars: 3, total: 3, unlocked: true,  progress: 100, difficulty: "easy",     clock: 15 },
  { id: 2, name: "Pro Pitch",     desc: "10s clock · Smart AI",          stars: 2, total: 3, unlocked: true,  progress: 60,  difficulty: "smart",    clock: 10 },
  { id: 3, name: "All-Star",      desc: "7s clock · Aggressive AI",      stars: 0, total: 3, unlocked: false, progress: 0,   difficulty: "hard",     clock: 7,  lockMsg: "Win 3 in Pro Pitch to unlock." },
  { id: 4, name: "Champions",     desc: "5s clock · Ruthless AI",        stars: 0, total: 3, unlocked: false, progress: 0,   difficulty: "ruthless", clock: 5,  lockMsg: "Reach All-Star tier to unlock." },
];

export const LB_DATA = {
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

export const LB_TOP = LB_DATA.global;

export const TRIVIA_DIFF = {
  easy:     "easy",
  smart:    "medium",
  hard:     "hard",
  ruthless: "hard",
};

export const GUEST_POOL = [
  "Shadow_GK", "Night_Striker", "Ghost_Winger", "Phantom_CF",
  "Dark_Keeper", "Storm_Back",   "Ice_Fwd",      "Fire_Mid",
  "Blaze_Sub",  "Dusk_Libero",
];

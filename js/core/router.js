// App state, router, and screen registry
// All screens import from here to get state, go(), render(), onUnmount()

import { LEAGUES } from "../data/constants.js";

const storedProfile  = JSON.parse(localStorage.getItem("xo_profile") || "null");
const params         = new URLSearchParams(window.location.search);
const joinCode       = params.get("join")      || null;
const challengeCode  = params.get("challenge") || null;

export const state = {
  screen:          "splash",
  profile:         storedProfile,
  joinCode,
  challengeCode,
  onboarding:      { nickname: "", gender: "" },
  opponent:        null,
  league:          LEAGUES[1],       // default to Pro Pitch
  sound:           true,
  haptics:         true,
  team:            "x",              // user's mark in solo mode
  score:           { x: 0, o: 0 },
  lastResult:      null,
  lastMatchLengthSec: 0,
  settings:        { soundOn: true, hapticsOn: true },
  leaderboardTab:  "global",
  playerRole:      null,             // "host" | "guest"
  gameCode:        null,             // invite_code for the current DB-backed game
  triviaQuestion:  null,             // { question, correct, options, category } shared for trivia_mp
  mpMark:          null,             // "x" | "o" — set after trivia_mp atomic claim
  lastPlayerRole:  null,             // preserved through gameover so rematch can route correctly
};

// Screen registry — each screen module registers itself here
export const SCREENS = {};

// Unmount callbacks for the current screen
let unmounters = [];
export const cleanup   = () => { unmounters.forEach(fn => { try { fn(); } catch {} }); unmounters = []; };
export const onUnmount = (fn) => unmounters.push(fn);

export function go(screen, opts = {}) {
  cleanup();
  state.screen = screen;
  if ("opponent" in opts) state.opponent    = opts.opponent;
  if ("result"   in opts) state.lastResult  = opts.result;
  if ("league"   in opts) state.league      = opts.league;
  render();
}

export function render() {
  const root   = document.getElementById("root");
  root.innerHTML = "";
  const screen = SCREENS[state.screen] || SCREENS.home;
  root.appendChild(screen());
}

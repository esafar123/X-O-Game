// Pitch X·O — entry point
// Imports register all screens into the SCREENS registry, then boots the router.

import { state, render } from "./js/core/router.js";
import "./js/core/network.js";         // offline banner + connection state

// ── Screens (side-effect imports: each file calls SCREENS.xxx = ...) ──
import "./js/screens/splash.js";
import "./js/screens/join.js";
import "./js/screens/onboarding.js";
import "./js/screens/code-reveal.js";
import "./js/screens/lobby.js";
import "./js/screens/board-mp.js";
import "./js/screens/trivia.js";
import "./js/screens/trivia-mp.js";
import "./js/screens/home.js";
import "./js/screens/friends.js";
import "./js/screens/add-friend.js";
import "./js/screens/matchmaking.js";
import "./js/screens/levels.js";
import "./js/screens/board.js";
import "./js/screens/gameover.js";
import "./js/screens/leaderboard.js";
import "./js/screens/settings.js";
import "./js/screens/profile.js";

// ── Boot ──
document.addEventListener("DOMContentLoaded", () => {
  if (state.joinCode) state.screen = "join";
  render();
});

import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn, XMark, OMark } from "../ui/icons.js";
import { TopBar, TimerRing, PlayerCard, refreshPlayerCard } from "../ui/components.js";
import { checkWin, aiMove } from "../utils/game.js";
import { LEAGUES } from "../data/constants.js";

SCREENS.board = () => {
  const userMark = state.team;
  const aiMark   = userMark === "x" ? "o" : "x";
  const opp      = state.opponent || { nm: "Marcus_77" };
  const league   = state.league   || LEAGUES[1];

  let board      = Array(9).fill(null);
  let turn       = "x";
  let result     = null;
  let time       = league.clock;
  let elapsedSec = 0;
  const score    = state.score;

  const wrap = h("div", { class: "screen-scroll pitch-bg-app board-screen" });
  wrap.appendChild(TopBar({
    title:    "Live Match",
    subtitle: `${league.name} · Round ${score.x + score.o + 1}`,
    leading:  IconBtn({ name: "close", onClick: () => go("home") }),
    trailing: IconBtn({ name: "more" }),
  }));

  const strip   = h("div", { class: "player-strip" });
  let youCard   = PlayerCard({ team: userMark, name: "You",    score: score[userMark], active: turn === userMark });
  const ringSlot = h("div");
  let oppCard   = PlayerCard({ team: aiMark,   name: opp.nm,  score: score[aiMark],   active: turn === aiMark  });
  strip.append(youCard, ringSlot, oppCard);
  wrap.appendChild(strip);

  const boardWrap = h("div", { class: "board-wrap" });
  const grid      = h("div", { class: "board" });
  boardWrap.appendChild(grid);
  wrap.appendChild(boardWrap);

  const indicator = h("div", { class: "turn-indicator" });
  wrap.appendChild(indicator);

  const renderRing = () => {
    ringSlot.innerHTML = "";
    ringSlot.appendChild(TimerRing({
      value: time, total: league.clock, size: 84,
      danger: time <= Math.ceil(league.clock / 3),
      label:  turn === userMark ? "your move" : "their move",
    }));
  };
  const renderStrip = () => {
    youCard = refreshPlayerCard(youCard, { team: userMark, name: "You",   score: score[userMark], active: turn === userMark && !result });
    oppCard = refreshPlayerCard(oppCard, { team: aiMark,   name: opp.nm, score: score[aiMark],   active: turn === aiMark  && !result });
  };
  const renderIndicator = () => {
    indicator.innerHTML = "";
    if (result) {
      let txt;
      if      (result.who === "draw")     txt = "STALEMATE.";
      else if (result.who === userMark)   txt = "YOU WIN.";
      else                                txt = "FULL TIME.";
      indicator.appendChild(h("div", { class: "head result" }, txt));
    } else {
      const headCls  = turn === userMark ? userMark : aiMark;
      const headText = turn === userMark ? "YOUR MARK" : `${(opp.nm || "MARCUS").toUpperCase()} IS THINKING`;
      indicator.appendChild(h("div", { class: `head ${headCls}` }, headText));
      indicator.appendChild(h("div", { class: "sub" },
        turn === userMark ? "Make it count." : "Hold the line."));
    }
  };
  const renderBoard = () => {
    grid.innerHTML = "";
    board.forEach((cell, i) => {
      const winning    = result?.line?.includes(i);
      const cls        = ["cell"];
      if (cell === "x")  cls.push("has-x");
      if (cell === "o")  cls.push("has-o");
      if (winning)       cls.push("win");
      const isDisabled = !!(cell || result || turn !== userMark);
      if (isDisabled)    cls.push("disabled");
      const btn = h("button", { class: cls.join(" "), type: "button", disabled: isDisabled, onclick: () => userPlace(i) });
      if (cell === "x") btn.appendChild(XMark({ size: 56, glow: true }));
      if (cell === "o") btn.appendChild(OMark({ size: 56, glow: true }));
      grid.appendChild(btn);
    });
  };
  const renderAll = () => { renderStrip(); renderRing(); renderBoard(); renderIndicator(); };

  function place(i, mark) {
    if (board[i] || result) return false;
    board[i] = mark;
    result   = checkWin(board);
    if (result) {
      if (result.who === "x") score.x += 1;
      if (result.who === "o") score.o += 1;
    }
    turn = mark === "x" ? "o" : "x";
    time = league.clock;
    renderAll();
    if (result)           finishSoon();
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

  const tick = setInterval(() => {
    elapsedSec += 1;
    if (result) return;
    time = Math.max(0, time - 1);
    renderRing();
    if (time === 0) {
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

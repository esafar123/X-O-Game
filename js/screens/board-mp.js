import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Logo, IconBtn, XMark, OMark } from "../ui/icons.js";
import { TopBar, PlayerCard } from "../ui/components.js";
import { db } from "../core/db.js";
import { checkWin } from "../utils/game.js";

SCREENS.board_mp = () => {
  const gameCode  = state.gameCode;
  const isHost    = state.playerRole === "host";
  const userMark  = state.mpMark || (isHost ? "x" : "o");
  const oppMark   = userMark === "x" ? "o" : "x";
  const opp       = state.opponent || { nm: "Opponent" };

  let board        = Array(9).fill(null);
  let turn         = "x";
  let result       = null;
  let elapsedSec   = 0;
  let isUpdating   = false;
  let lastBoardStr = JSON.stringify(board);
  let pollId       = null;
  const score      = state.score;

  const wrap = h("div", { class: "screen-scroll pitch-bg-app board-screen" });
  wrap.appendChild(TopBar({
    title: "Live Match", subtitle: "Online · 1v1",
    leading:  IconBtn({ name: "close",  onClick: () => { clearInterval(pollId); state.score = { x: 0, o: 0 }; go("home"); } }),
    trailing: IconBtn({ name: "more" }),
  }));

  const strip = h("div", { class: "player-strip" });
  let youCard = PlayerCard({ team: userMark, name: "You",  score: score[userMark], active: turn === userMark });
  const midEl = h("div", { style: { display: "flex", alignItems: "center", justifyContent: "center" } }, Logo({ size: 46 }));
  let oppCard = PlayerCard({ team: oppMark,  name: opp.nm, score: score[oppMark],  active: turn === oppMark });
  strip.append(youCard, midEl, oppCard);
  wrap.appendChild(strip);

  const boardWrap = h("div", { class: "board-wrap" });
  const grid      = h("div", { class: "board" });
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
      const disabled = !!(cell || result || turn !== userMark || isUpdating);
      if (disabled) cls.push("disabled");
      const btn = h("button", { class: cls.join(" "), type: "button", disabled, onclick: () => userPlace(i) });
      if (cell === "x") btn.appendChild(XMark({ size: 56, glow: true }));
      if (cell === "o") btn.appendChild(OMark({ size: 56, glow: true }));
      grid.appendChild(btn);
    });
  };
  const renderAll = () => { renderStrip(); renderBoard(); renderIndicator(); };

  function applyMove(i, mark) {
    if (board[i] || result) return;
    board[i] = mark;
    result = checkWin(board);
    if (result) {
      if (result.who === "x") score.x += 1;
      if (result.who === "o") score.o += 1;
    }
    turn = mark === "x" ? "o" : "x";
  }

  function userPlace(i) {
    if (turn !== userMark || result || board[i] || isUpdating) return;
    isUpdating = true;
    applyMove(i, userMark);
    renderAll();
    const snap = JSON.stringify(board);
    db.from("games").update({
      board:  snap,
      turn:   turn,
      status: result ? "finished" : "active",
    }).eq("invite_code", gameCode).then(() => {
      lastBoardStr = snap;
      isUpdating   = false;
      if (result) finishSoon();
    });
  }

  function finishSoon() {
    clearInterval(pollId);
    const t = setTimeout(() => {
      state.lastMatchLengthSec = elapsedSec;
      go("gameover", { result: { ...result, userMark } });
    }, 1100);
    onUnmount(() => clearTimeout(t));
  }

  const tick = setInterval(() => { elapsedSec += 1; }, 1000);
  onUnmount(() => {
    clearInterval(tick);
    clearInterval(pollId);
    state.lastPlayerRole = state.playerRole;   // preserve for gameover rematch routing
    state.playerRole     = null;
    state.gameCode       = null;
    state.mpMark         = null;
  });

  // Poll for opponent moves (skip when it's our turn or updating)
  pollId = setInterval(async () => {
    if (turn === userMark || result || isUpdating) return;
    const { data } = await db
      .from("games").select("board,turn,status").eq("invite_code", gameCode).single();
    if (!data || data.board === lastBoardStr) return;
    lastBoardStr = data.board;
    const dbBoard = JSON.parse(data.board);
    // Find and apply the cell that changed
    for (let i = 0; i < 9; i++) {
      if (board[i] === null && dbBoard[i] !== null) {
        applyMove(i, dbBoard[i]);
        break;
      }
    }
    renderAll();
    if (result) finishSoon();
  }, 1500);

  renderAll();
  return wrap;
};

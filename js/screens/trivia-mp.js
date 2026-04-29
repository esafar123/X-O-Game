import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { TopBar, TimerRing } from "../ui/components.js";
import { db } from "../core/db.js";

SCREENS.trivia_mp = () => {
  const q        = state.triviaQuestion;
  const gameCode = state.gameCode;
  const isHost   = state.playerRole === "host";
  const myName   = state.profile?.nickname || "Player";

  const wrap = h("div", { class: "screen-scroll pitch-bg-app trivia-screen" });
  wrap.appendChild(TopBar({ title: "Pre-match · 1v1" }));

  const body = h("div", { class: "trivia-body" });
  wrap.appendChild(body);

  let answered  = false;
  let timer     = 10;
  let timerId   = null;
  let pollId    = null;
  let fallbackT = null;
  const timerWrap = h("div");

  onUnmount(() => {
    clearInterval(timerId);
    clearInterval(pollId);
    clearTimeout(fallbackT);
  });

  // Navigate to board after resolving who gets X
  const proceedToMatch = (myMark) => {
    clearInterval(timerId);
    clearInterval(pollId);
    clearTimeout(fallbackT);
    state.mpMark = myMark;
    setTimeout(() => go("board_mp"), 1000);
  };

  // Poll DB until x_winner is set
  const waitForWinner = () => {
    // Host: if nobody claimed after 3 s, claim X as default (first-mover advantage)
    if (isHost) {
      fallbackT = setTimeout(async () => {
        await db.from("games")
          .update({ x_winner: myName })
          .is("x_winner", null)
          .eq("invite_code", gameCode)
          .select("x_winner");
      }, 3000);
    }
    pollId = setInterval(async () => {
      const { data } = await db.from("games")
        .select("x_winner").eq("invite_code", gameCode).single();
      if (data?.x_winner) {
        clearInterval(pollId);
        clearTimeout(fallbackT);
        const myMark   = data.x_winner === myName ? "x" : "o";
        const resultEl = body.querySelector(".trivia-result");
        if (resultEl) {
          resultEl.textContent = myMark === "x" ? "⚽ You kick off!" : `${data.x_winner} kicks off — you defend.`;
          resultEl.style.color = myMark === "x" ? "var(--win)" : "var(--fg-3)";
        }
        proceedToMatch(myMark);
      }
    }, 800);
  };

  // Try to atomically claim X for correct answer
  const claimX = async () => {
    const { data, error } = await db.from("games")
      .update({ x_winner: myName })
      .is("x_winner", null)
      .eq("invite_code", gameCode)
      .select("x_winner");
    const claimed  = !error && data?.length > 0 && data[0].x_winner === myName;
    const resultEl = body.querySelector(".trivia-result");
    if (claimed) {
      if (resultEl) { resultEl.textContent = "⚽ You claimed kick-off!"; resultEl.style.color = "var(--win)"; }
      proceedToMatch("x");
    } else {
      if (resultEl) { resultEl.textContent = "Race lost — waiting…"; resultEl.style.color = "var(--fg-3)"; }
      waitForWinner();
    }
  };

  // Handle answer selection (or null for timeout)
  const handleAnswer = (selected, correct, optEls) => {
    if (answered) return;
    answered = true;
    clearInterval(timerId);
    const isCorrect = selected !== null && selected === correct;
    optEls.forEach(({ el, val }) => {
      if (val === correct)                     el.classList.add("correct");
      else if (val === selected && !isCorrect) el.classList.add("wrong");
      el.disabled = true;
    });
    const resultEl = body.querySelector(".trivia-result");
    if (resultEl) {
      resultEl.textContent = isCorrect ? "✓ Correct — claiming kick-off…" : "✗ Wrong — waiting…";
      resultEl.style.color = isCorrect ? "var(--win)" : "var(--fg-3)";
    }
    if (isCorrect) claimX(); else waitForWinner();
  };

  const updateTimerEl = () => {
    timerWrap.innerHTML = "";
    timerWrap.appendChild(TimerRing({ value: timer, total: 10, size: 72, danger: timer <= 3 }));
  };

  // Build the question UI (called after 3-2-1 countdown)
  const showQuestion = () => {
    if (!q) { state.mpMark = isHost ? "x" : "o"; go("board_mp"); return; }
    const { question, correct, options, category } = q;
    body.innerHTML = "";
    updateTimerEl();
    body.appendChild(timerWrap);
    body.appendChild(h("div", { class: "trivia-category" }, category));
    body.appendChild(h("div", { class: "trivia-question" }, question));
    body.appendChild(h("div", { class: "trivia-hint" }, "First correct answer kicks off!"));
    const grid   = h("div", { class: "trivia-options" });
    const optEls = options.map(val => {
      const el = h("button", {
        class: "trivia-opt", type: "button",
        onclick: () => handleAnswer(val, correct, optEls),
      }, val);
      grid.appendChild(el);
      return { el, val };
    });
    body.appendChild(grid);
    body.appendChild(h("div", { class: "trivia-result" }));
    timerId = setInterval(() => {
      timer--;
      updateTimerEl();
      if (timer <= 0) { clearInterval(timerId); if (!answered) handleAnswer(null, correct, optEls); }
    }, 1000);
  };

  // Synchronized 3-2-1 countdown — both players see question at the same moment
  let countdown = 3;
  const countEl = h("div", { class: "trivia-countdown" }, `${countdown}`);
  body.appendChild(h("div", { class: "trivia-question", style: { textAlign: "center", fontSize: "20px" } }, "Get ready…"));
  body.appendChild(countEl);
  const cdId = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countEl.textContent = `${countdown}`;
    } else {
      clearInterval(cdId);
      showQuestion();
    }
  }, 1000);
  onUnmount(() => clearInterval(cdId));

  return wrap;
};

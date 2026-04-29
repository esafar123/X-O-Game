import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn } from "../ui/icons.js";
import { TopBar, TimerRing } from "../ui/components.js";
import { decodeHTML, shuffle } from "../utils/helpers.js";
import { TRIVIA_DIFF } from "../data/constants.js";

SCREENS.trivia = () => {
  const league = state.league;
  const diff   = TRIVIA_DIFF[league.difficulty] || "medium";

  const wrap = h("div", { class: "screen-scroll pitch-bg-app trivia-screen" });
  wrap.appendChild(TopBar({
    title:   `Pre-match · ${league.name}`,
    leading: IconBtn({ name: "close", onClick: () => go("home") }),
  }));

  const body   = h("div", { class: "trivia-body" });
  const loadEl = h("div", { class: "trivia-loading" }, "Loading question…");
  body.appendChild(loadEl);
  wrap.appendChild(body);

  let answered = false;
  let timer    = 10;
  let timerId  = null;
  const timerWrap = h("div");

  const proceedToGame = (correct) => {
    state.team     = correct ? "x" : "o";
    state.opponent = null;
    go("matchmaking");
  };

  const handleAnswer = (selected, correct, optEls) => {
    if (answered) return;
    answered = true;
    clearInterval(timerId);
    const isCorrect = selected === correct;
    optEls.forEach(({ el, val }) => {
      if (val === correct)                     el.classList.add("correct");
      else if (val === selected && !isCorrect) el.classList.add("wrong");
      el.disabled = true;
    });
    const resultEl = body.querySelector(".trivia-result");
    if (resultEl) {
      resultEl.textContent = isCorrect ? "✓ Correct — you kick off!" : "✗ Wrong — AI kicks off!";
      resultEl.style.color = isCorrect ? "var(--win)" : "var(--eliminate)";
    }
    setTimeout(() => proceedToGame(isCorrect), 1500);
  };

  const updateTimerEl = () => {
    timerWrap.innerHTML = "";
    timerWrap.appendChild(TimerRing({ value: timer, total: 10, size: 72, danger: timer <= 3 }));
  };

  fetch(`https://opentdb.com/api.php?amount=1&difficulty=${diff}&type=multiple`)
    .then(r => r.json())
    .then(data => {
      if (data.response_code !== 0 || !data.results?.length) throw new Error();
      const q        = data.results[0];
      const question = decodeHTML(q.question);
      const correct  = decodeHTML(q.correct_answer);
      const options  = shuffle([correct, ...q.incorrect_answers.map(decodeHTML)]);

      body.innerHTML = "";
      updateTimerEl();
      body.appendChild(timerWrap);
      body.appendChild(h("div", { class: "trivia-category" }, decodeHTML(q.category)));
      body.appendChild(h("div", { class: "trivia-question" }, question));
      body.appendChild(h("div", { class: "trivia-hint" }, "Answer correctly to kick off first"));

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
        if (timer <= 0) {
          clearInterval(timerId);
          if (!answered) handleAnswer(null, correct, optEls);
        }
      }, 1000);
    })
    .catch(() => proceedToGame(true)); // API fail → just start, user kicks off

  onUnmount(() => clearInterval(timerId));
  return wrap;
};

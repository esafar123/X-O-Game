import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h, svg, svgEl } from "../utils/dom.js";
import { Logo, IconBtn } from "../ui/icons.js";
import { PitchButton, TopBar } from "../ui/components.js";
import { db } from "../core/db.js";
import { decodeHTML, shuffle } from "../utils/helpers.js";

SCREENS.lobby = () => {
  const code    = state.profile?.friend_code || "";
  const myName  = state.profile?.nickname    || "You";
  const statusEl = h("div", { class: "tick" }, "Preparing match…");
  let pollId = null;

  const cancelFn = () => {
    clearInterval(pollId);
    db.from("games").update({ status: "cancelled" }).eq("invite_code", code);
    state.gameCode = null;
    go("home");
  };
  onUnmount(() => clearInterval(pollId));

  // Fetch trivia question first, then write the game row
  (async () => {
    let triviaQ = null;
    try {
      const r    = await fetch("https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple");
      const data = await r.json();
      if (data.response_code === 0 && data.results?.length) {
        const q = data.results[0];
        triviaQ = {
          question: decodeHTML(q.question),
          correct:  decodeHTML(q.correct_answer),
          options:  shuffle([decodeHTML(q.correct_answer), ...q.incorrect_answers.map(decodeHTML)]),
          category: decodeHTML(q.category),
        };
      }
    } catch {}
    state.triviaQuestion = triviaQ;

    const { error } = await db.from("games").upsert({
      invite_code: code,
      host_name:   myName,
      guest_name:  null,
      status:      "waiting",
      board:       JSON.stringify(Array(9).fill(null)),
      turn:        "x",
      q_json:      triviaQ ? JSON.stringify(triviaQ) : null,
      x_winner:    null,
    });
    if (error) {
      statusEl.textContent = "DB error — check Supabase games table.";
      statusEl.style.color = "var(--eliminate)";
      console.error("Lobby upsert:", error);
      return;
    }
    statusEl.textContent = code;
    state.gameCode = code;

    // Poll every 2 s — detect when guest updates status to "active"
    pollId = setInterval(async () => {
      const { data } = await db
        .from("games").select("status,guest_name").eq("invite_code", code).single();
      if (data?.status === "active" && data.guest_name) {
        clearInterval(pollId);
        state.opponent   = { nm: data.guest_name, init: data.guest_name[0]?.toUpperCase() || "?", status: "online", meta: "Via QR invite", stats: "" };
        state.playerRole = "host";
        statusEl.textContent = `${data.guest_name} joined — trivia time!`;
        setTimeout(() => { state.score = { x: 0, o: 0 }; go("trivia_mp"); }, 500);
      }
    }, 2000);
  })();

  const wrap = h("div", { class: "screen-scroll pitch-bg-app matchmaking" });
  wrap.appendChild(TopBar({
    title: "Waiting for Friend",
    leading: IconBtn({ name: "close", onClick: cancelFn }),
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
  body.appendChild(h("div", { class: "head" }, "WAITING FOR FRIEND"));
  body.appendChild(statusEl);
  body.appendChild(h("div", { class: "desc" }, "Share your QR — the match starts the moment they accept."));
  wrap.appendChild(body);
  wrap.appendChild(h("div", { class: "footer" },
    PitchButton({ label: "Cancel", variant: "ghost", full: true, onClick: cancelFn }),
  ));
  return wrap;
};

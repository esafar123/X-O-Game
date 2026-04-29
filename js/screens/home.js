import { SCREENS, state, go, onUnmount } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn } from "../ui/icons.js";
import { TopBar } from "../ui/components.js";
import { db } from "../core/db.js";
import { decodeHTML, shuffle } from "../utils/helpers.js";

SCREENS.home = () => {
  const profile  = state.profile;
  const nick     = profile?.nickname || "Player";
  const code     = profile?.friend_code || null;
  const myCode   = code;

  const hour     = new Date().getHours();
  const timeTag  = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const days     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const matchday = `Matchday · ${days[new Date().getDay()]}`;

  const wrap = h("div", { class: "screen-scroll pitch-bg-app" });

  wrap.appendChild(TopBar({
    title:    "Pitch XO",
    subtitle: matchday,
    leading:  IconBtn({ name: "user",    onClick: () => go("profile")    }),
    trailing: IconBtn({ name: "friends", onClick: () => go("add_friend") }),
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

  // ── Incoming challenge watcher ───────────────────────────────────
  if (myCode) {
    let activeChallengeId = null;

    const checkChallenges = async () => {
      // Skip if a modal is already showing
      if (document.querySelector(".chal-modal")) return;

      const { data } = await db
        .from("challenges")
        .select("id, from_code, from_name")
        .eq("to_code", myCode)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data || document.querySelector(".chal-modal")) return;

      activeChallengeId = data.id;
      showChallengeModal(data);
    };

    const showChallengeModal = (challenge) => {
      const root = document.querySelector("#root");
      const initial = challenge.from_name?.[0]?.toUpperCase() || "?";

      const modal = h("div", { class: "chal-modal" });

      const accept = async () => {
        modal.remove();
        clearInterval(pollId);

        // Fetch trivia question
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

        // Create game using own friend_code as invite_code (same as lobby.js)
        await db.from("games").upsert({
          invite_code: myCode,
          host_name:   nick,
          guest_name:  null,
          status:      "waiting",
          board:       JSON.stringify(Array(9).fill(null)),
          turn:        "x",
          q_json:      triviaQ ? JSON.stringify(triviaQ) : null,
          x_winner:    null,
        });

        // Mark challenge accepted with the game code
        await db.from("challenges")
          .update({ status: "accepted", game_code: myCode })
          .eq("id", activeChallengeId);

        // Become host and wait in lobby
        state.gameCode   = myCode;
        state.playerRole = "host";
        state.opponent   = {
          nm: challenge.from_name, init: initial,
          status: "online", meta: "Challenge", stats: "",
        };
        state.score = { x: 0, o: 0 };
        go("lobby");
      };

      const decline = async () => {
        modal.remove();
        await db.from("challenges").delete().eq("id", activeChallengeId);
        activeChallengeId = null;
      };

      modal.appendChild(h("div", { class: "chal-modal-box" },
        h("div", { class: "chal-modal-avatar" },
          h("div", { class: "avatar", style: { width: "64px", height: "64px", fontSize: "26px" } }, initial),
        ),
        h("div", { class: "chal-modal-title" }, `${challenge.from_name}`),
        h("div", { class: "chal-modal-sub"   }, "wants to play you right now"),
        h("div", { class: "chal-modal-code"  }, challenge.from_code),
        h("div", { class: "chal-modal-actions" },
          h("button", { class: "chal-modal-btn accept", type: "button", onclick: accept  }, "Accept"),
          h("button", { class: "chal-modal-btn decline", type: "button", onclick: decline }, "Decline"),
        ),
      ));

      root.appendChild(modal);
    };

    // Check immediately then every 5 s
    checkChallenges();
    const pollId = setInterval(checkChallenges, 5000);
    onUnmount(() => clearInterval(pollId));
  }

  return wrap;
};

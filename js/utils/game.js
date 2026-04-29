// Core game logic — win detection, minimax AI

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWin(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
  }
  if (b.every(Boolean)) return { who: "draw", line: [] };
  return null;
}

export function minimax(b, ai, human, current) {
  const r = checkWin(b);
  if (r) {
    if (r.who === ai)    return { score:  10 };
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

export function aiMove(board, ai, human, difficulty) {
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

// Screens.jsx — All Pitch X&O click-through screens.
// Reads global components from PitchUI.jsx (window.*).
// Exports: SplashScreen, HomeScreen, FriendsScreen, MatchmakingScreen,
//          LevelsScreen, BoardScreen, GameOverScreen, LeaderboardScreen, SettingsScreen

const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// SPLASH / LOGIN
// ─────────────────────────────────────────────────────────────
function SplashScreen({ go }) {
  return (
    <div style={{
      ...PITCH_BG, height: "100%", display: "flex", flexDirection: "column",
      paddingTop: 80, paddingBottom: 60, alignItems: "center", color: "var(--fg-1)",
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Logo size={108}/>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 72, lineHeight: 0.9, letterSpacing: "0.04em", textAlign: "center" }}>
          PITCH<br/>
          <span style={{ color: "var(--flood-500)" }}>X<span style={{ color: "var(--fg-1)" }}>·</span>O</span>
        </div>
        <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>
          The floodlit night-game
        </div>
      </div>
      <div style={{ width: "100%", padding: "0 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <PitchButton variant="primary" full iconRight="forward" onClick={() => go("home")}>READY UP</PitchButton>
        <PitchButton variant="ghost" full onClick={() => go("home")}>Continue as guest</PitchButton>
        <div style={{ textAlign: "center", marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          v 1.0 · Pre-season
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME / MAIN MENU
// ─────────────────────────────────────────────────────────────
function HomeScreen({ go }) {
  return (
    <div style={{ ...PITCH_BG, height: "100%", overflowY: "auto", color: "var(--fg-1)", paddingBottom: 40 }}>
      <TopBar
        title="Pitch XO"
        subtitle="Pre-season · Week 3"
        leading={<IconBtn name="settings" onClick={() => go("settings")}/>}
        trailing={<IconBtn name="friends" onClick={() => go("friends")}/>}
      />
      {/* Streak hero */}
      <div style={{ margin: "8px 20px 20px", padding: "20px 22px",
        background: "var(--surface)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--border)", boxShadow: "var(--shadow-2)",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div className="label" style={{ color: "var(--fg-3)", fontFamily: "var(--font-headline)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11 }}>
            Current streak
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 0.9, color: "var(--flood-500)", letterSpacing: "0.04em" }}>5W</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>
            One more win to crack the top 200.
          </div>
        </div>
        <div style={{ width: 80, height: 80, borderRadius: "var(--r-pill)", display: "grid", placeItems: "center",
          background: "var(--pitch-900)", boxShadow: "var(--glow-flood)" }}>
          <Icon name="bolt" size={40} color="var(--flood-500)"/>
        </div>
      </div>

      {/* Primary actions */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <ActionTile
          title="Quick match"
          desc="Find an opponent · 15s clock"
          icon="bolt"
          accent
          onClick={() => go("matchmaking")}
        />
        <ActionTile
          title="Play a friend"
          desc="3 friends online"
          icon="swords"
          onClick={() => go("friends")}
        />
        <ActionTile
          title="Leagues"
          desc="2 of 4 unlocked"
          icon="trophy"
          onClick={() => go("levels")}
        />
        <ActionTile
          title="Leaderboard"
          desc="You're ranked #214"
          icon="star"
          onClick={() => go("leaderboard")}
        />
      </div>
    </div>
  );
}

function ActionTile({ title, desc, icon, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "16px 18px", borderRadius: "var(--r-lg)",
      background: accent ? "var(--flood-500)" : "var(--surface)",
      color: accent ? "var(--pitch-900)" : "var(--fg-1)",
      border: accent ? "none" : "1px solid var(--border)",
      boxShadow: accent ? "var(--shadow-pop)" : "var(--shadow-1)",
      cursor: "pointer", textAlign: "left",
      width: "100%",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "var(--r-md)",
        background: accent ? "rgba(0,0,0,0.18)" : "var(--pitch-600)",
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={22} color={accent ? "var(--pitch-900)" : "var(--flood-500)"}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: 17, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, marginTop: 2, opacity: accent ? 0.75 : 1, color: accent ? "var(--pitch-900)" : "var(--fg-3)" }}>{desc}</div>
      </div>
      <Icon name="forward" size={18} color={accent ? "var(--pitch-900)" : "var(--fg-3)"}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// FRIENDS
// ─────────────────────────────────────────────────────────────
const FRIENDS = [
  { id: 1, nm: "Marcus_77",  init: "M", status: "online", meta: "Online · Champions",   stats: "12W · 3L",  team: "x" },
  { id: 2, nm: "Anya.B",     init: "A", status: "busy",   meta: "In match · 2:14",       stats: "8W · 4L",   team: "o" },
  { id: 3, nm: "Kai_GG",     init: "K", status: "offline",meta: "Last seen 2h ago",      stats: "15W · 9L" },
  { id: 4, nm: "Rho.Striker",init: "R", status: "online", meta: "Online · Pro Pitch",    stats: "21W · 7L" },
  { id: 5, nm: "TomTom",     init: "T", status: "offline",meta: "Last seen yesterday",   stats: "4W · 11L" },
  { id: 6, nm: "Jules99",    init: "J", status: "online", meta: "Online · Sunday",       stats: "9W · 2L" },
];

function FriendsScreen({ go, challenge }) {
  return (
    <div style={{ height: "100%", overflowY: "auto", color: "var(--fg-1)", paddingBottom: 40 }}>
      <TopBar
        title="Roster"
        leading={<IconBtn name="back" onClick={() => go("home")}/>}
        trailing={<IconBtn name="plus"/>}
      />
      <div style={{ padding: "0 20px 14px", display: "flex", gap: 8 }}>
        <Badge tone="flood">3 online</Badge>
        <Badge tone="default">6 total</Badge>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {FRIENDS.map(f => (
          <div key={f.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: "var(--r-lg)",
            background: "var(--surface)", border: "1px solid var(--border)",
            opacity: f.status === "offline" ? 0.55 : 1,
          }}>
            <Avatar initial={f.init} size={42} team={f.team} status={f.status}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.nm}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{f.meta}</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)", marginRight: 6 }}>{f.stats}</div>
            {f.status === "online" ? (
              <button onClick={() => challenge(f)} style={{
                background: "var(--flood-500)", color: "var(--pitch-900)",
                border: "none", borderRadius: "var(--r-pill)",
                padding: "7px 12px", cursor: "pointer",
                fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10,
              }}>Challenge</button>
            ) : f.status === "busy" ? (
              <button style={{ background: "transparent", color: "var(--fg-2)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-pill)", padding: "7px 12px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>Watch</button>
            ) : (
              <button style={{ background: "transparent", color: "var(--fg-3)", border: "1px solid var(--border)", borderRadius: "var(--r-pill)", padding: "7px 12px", cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>Invite</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MATCHMAKING
// ─────────────────────────────────────────────────────────────
function MatchmakingScreen({ go, opponent }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT(v => v + 1), 1000);
    const j = setTimeout(() => go("board"), 4500);
    return () => { clearInterval(i); clearTimeout(j); };
  }, []);
  return (
    <div style={{ ...PITCH_BG, height: "100%", display: "flex", flexDirection: "column", color: "var(--fg-1)" }}>
      <TopBar title="Finding match" leading={<IconBtn name="close" onClick={() => go("home")}/>}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "0 28px" }}>
        <div style={{ position: "relative", width: 180, height: 180, display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 180 180" style={{ position: "absolute", inset: 0, animation: "pulse 2s ease-in-out infinite" }}>
            <circle cx="90" cy="90" r="80" fill="none" stroke="var(--flood-500)" strokeWidth="2" strokeOpacity="0.25"/>
            <circle cx="90" cy="90" r="60" fill="none" stroke="var(--flood-500)" strokeWidth="2" strokeOpacity="0.4"/>
            <circle cx="90" cy="90" r="40" fill="none" stroke="var(--flood-500)" strokeWidth="2" strokeOpacity="0.6"/>
          </svg>
          <Logo size={70}/>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "0.04em", textAlign: "center", lineHeight: 1 }}>SCANNING THE PITCH</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--flood-500)", textTransform: "uppercase", letterSpacing: "0.16em" }}>
          {opponent ? `Calling ${opponent.nm}…` : `Searching · ${t}s`}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-3)", textAlign: "center", maxWidth: 260, marginTop: 6 }}>
          Matching by rank and connection. Average wait: 6 seconds.
        </div>
      </div>
      <div style={{ padding: "0 28px 24px" }}>
        <PitchButton variant="ghost" full onClick={() => go("home")}>Cancel</PitchButton>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.96);} 50% { opacity: 1; transform: scale(1.04); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEVELS / LEAGUES
// ─────────────────────────────────────────────────────────────
const LEAGUES = [
  { id: 1, name: "Sunday League", desc: "Casual · 15s clock · Easy AI",  stars: 3, total: 3, unlocked: true,  progress: 100 },
  { id: 2, name: "Pro Pitch",     desc: "10s clock · Smart AI",          stars: 2, total: 3, unlocked: true,  progress: 60  },
  { id: 3, name: "All-Star",      desc: "7s clock · Aggressive AI",      stars: 0, total: 3, unlocked: false, progress: 0,
    lockMsg: "Win 3 in Pro Pitch to unlock." },
  { id: 4, name: "Champions",     desc: "5s clock · Ruthless AI",        stars: 0, total: 3, unlocked: false, progress: 0,
    lockMsg: "Reach All-Star tier to unlock." },
];

function LevelsScreen({ go }) {
  return (
    <div style={{ height: "100%", overflowY: "auto", color: "var(--fg-1)", paddingBottom: 40 }}>
      <TopBar title="Leagues" leading={<IconBtn name="back" onClick={() => go("home")}/>} trailing={<IconBtn name="more"/>}/>
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: "0.03em", lineHeight: 1 }}>
          PRO <span style={{ color: "var(--flood-500)" }}>PITCH</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>
          Currently in this tier · 6/10 wins
        </div>
        <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "60%", background: "var(--flood-500)", boxShadow: "0 0 12px rgba(212,255,0,0.6)" }}/>
        </div>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
        {LEAGUES.map(L => <LeagueCard key={L.id} L={L} onPlay={() => go("matchmaking")}/>)}
      </div>
    </div>
  );
}

function LeagueCard({ L, onPlay }) {
  return (
    <div style={{
      borderRadius: "var(--r-lg)", padding: "16px 18px",
      background: "var(--surface)",
      border: L.unlocked ? "1px solid rgba(212,255,0,0.30)" : "1px solid var(--border)",
      boxShadow: L.unlocked ? "0 0 24px rgba(212,255,0,0.08)" : "none",
      opacity: L.unlocked ? 1 : 0.55,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
          League 0{L.id}
        </span>
        {L.unlocked ? (
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: L.total }).map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                fill={i < L.stars ? "var(--flood-500)" : "rgba(255,255,255,0.15)"}
                style={{ filter: i < L.stars ? "drop-shadow(0 0 4px rgba(212,255,0,0.5))" : "none" }}>
                <polygon points="12,2 15,9 22,9.5 16.5,14 18,21 12,17 6,21 7.5,14 2,9.5 9,9"/>
              </svg>
            ))}
          </div>
        ) : <Icon name="lock" size={14} color="var(--fg-3)"/>}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "0.03em", lineHeight: 1, color: L.unlocked ? "var(--fg-1)" : "var(--fg-2)" }}>
          {L.name}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>{L.desc}</div>
      </div>
      {L.unlocked ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${L.progress}%`, background: "var(--flood-500)" }}/>
          </div>
          <button onClick={onPlay} style={{
            background: "var(--flood-500)", color: "var(--pitch-900)", border: "none",
            borderRadius: "var(--r-pill)", padding: "8px 16px", cursor: "pointer",
            fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}><Icon name="play" size={11} color="var(--pitch-900)"/> Play</button>
        </div>
      ) : (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          🔒 {L.lockMsg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOARD — the actual X&O game
// ─────────────────────────────────────────────────────────────
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function checkWin(b) {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a,c,d] };
  if (b.every(Boolean)) return { who: "draw", line: [] };
  return null;
}

function BoardScreen({ go, opponent, finish }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("x");
  const [time, setTime] = useState(15);
  const [score, setScore] = useState({ x: 1, o: 0 });

  const result = checkWin(board);

  useEffect(() => {
    if (result) {
      const tm = setTimeout(() => finish(result), 900);
      return () => clearTimeout(tm);
    }
    setTime(15);
    const i = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(i);
  }, [turn, result]);

  function place(i) {
    if (board[i] || result) return;
    const next = [...board]; next[i] = turn;
    setBoard(next);
    setTurn(turn === "x" ? "o" : "x");
  }

  return (
    <div style={{ ...PITCH_BG, height: "100%", display: "flex", flexDirection: "column", color: "var(--fg-1)" }}>
      <TopBar
        title="Live Match"
        subtitle={`Pro Pitch · Round ${score.x + score.o + 1}`}
        leading={<IconBtn name="close" onClick={() => go("home")}/>}
        trailing={<IconBtn name="more"/>}
      />

      {/* Player chrome */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, padding: "0 20px 16px", alignItems: "center" }}>
        <PlayerCard team="x" name="You"             score={score.x} active={turn === "x" && !result}/>
        <TimerRing value={time} total={15} size={84} danger={time <= 5} label={turn === "x" ? "your move" : "their move"}/>
        <PlayerCard team="o" name={opponent?.nm || "Marcus_77"} score={score.o} active={turn === "o" && !result}/>
      </div>

      {/* Board */}
      <div style={{ padding: "0 20px", flex: 1, display: "grid", placeItems: "center" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
          width: "100%", aspectRatio: "1 / 1", maxWidth: 360,
          padding: 10, borderRadius: "var(--r-xl)",
          background: "rgba(0,0,0,0.25)", border: "1.5px solid rgba(255,255,255,0.18)",
          boxShadow: "var(--shadow-3)",
        }}>
          {board.map((cell, i) => {
            const winning = result?.line?.includes(i);
            const borderColor = winning ? "var(--flood-500)"
              : cell === "x" ? "rgba(255,255,255,0.40)"
              : cell === "o" ? "rgba(0,229,255,0.5)"
              : "rgba(255,255,255,0.18)";
            const glow = winning ? "var(--glow-flood)"
              : cell === "x" ? "var(--glow-x)"
              : cell === "o" ? "var(--glow-o)"
              : "none";
            return (
              <button key={i} onClick={() => turn === "x" && place(i)} style={{
                aspectRatio: "1/1", borderRadius: "var(--r-lg)",
                background: winning ? "rgba(212,255,0,0.10)" : "var(--surface)",
                border: `2px solid ${borderColor}`,
                boxShadow: glow,
                display: "grid", placeItems: "center",
                cursor: cell || result ? "default" : "pointer", padding: 0,
                transition: "all 220ms var(--ease-out)",
              }}>
                {cell === "x" && <XMark size={56} glow/>}
                {cell === "o" && <OMark size={56} glow/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Turn indicator */}
      <div style={{ padding: "16px 20px 28px", textAlign: "center" }}>
        {result ? (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--flood-500)", letterSpacing: "0.04em" }}>
            {result.who === "draw" ? "STALEMATE." : result.who === "x" ? "YOU WIN." : "FULL TIME."}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "0.04em", lineHeight: 1,
              color: turn === "x" ? "var(--x-chalk)" : "var(--o-cyan)" }}>
              {turn === "x" ? "YOUR MARK" : `${opponent?.nm || "MARCUS"} IS THINKING`}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>
              {turn === "x" ? "Make it count." : "Hold the line."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ team, name, score, active }) {
  const isX = team === "x";
  // X-chalk needs to glow flood when actively eliminating? No — X glow is white. Eliminate red is reserved for the loss overlay.
  const color = isX ? "var(--x-chalk)" : "var(--o-cyan)";
  return (
    <div style={{
      padding: "10px 12px", borderRadius: "var(--r-lg)",
      background: "var(--surface)", border: `1px solid ${active ? color : "var(--border)"}`,
      boxShadow: active ? (isX ? "var(--glow-x)" : "var(--glow-o)") : "none",
      transition: "all 220ms var(--ease-out)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "var(--r-pill)",
          background: "var(--pitch-900)", display: "grid", placeItems: "center",
        }}>
          {isX ? <XMark size={16}/> : <OMark size={16}/>}
        </div>
        <div style={{ fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color, letterSpacing: "0.04em", lineHeight: 1, marginTop: 4 }}>{score}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME OVER
// ─────────────────────────────────────────────────────────────
function GameOverScreen({ go, result, opponent }) {
  const youWon = result?.who === "x";
  const draw = result?.who === "draw";
  const headline = draw ? "STALEMATE." : youWon ? "FULL TIME — YOU WIN" : "FULL TIME";
  const sub      = draw ? "Run it back?" : youWon ? "Clean sheet. Pitch is yours." : `${opponent?.nm || "Marcus"} took it 2-1.`;
  const accent   = draw ? "var(--draw)" : youWon ? "var(--win)" : "var(--loss)";

  return (
    <div style={{ ...PITCH_BG, height: "100%", display: "flex", flexDirection: "column", color: "var(--fg-1)" }}>
      <TopBar title="Full time" leading={<IconBtn name="home" onClick={() => go("home")}/>}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 28px" }}>
        <div style={{ width: 110, height: 110, borderRadius: "var(--r-pill)", background: "var(--pitch-900)", display: "grid", placeItems: "center", boxShadow: youWon ? "var(--glow-flood)" : "var(--shadow-3)" }}>
          {youWon
            ? <Icon name="trophy" size={56} color="var(--flood-500)"/>
            : draw
              ? <div style={{ display: "flex", gap: 6 }}><XMark size={32}/><OMark size={32}/></div>
              : <OMark size={56} glow/>}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: youWon ? 56 : 44, lineHeight: 0.95, textAlign: "center", color: accent, letterSpacing: "0.03em" }}>
          {headline}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--fg-2)", textAlign: "center", maxWidth: 280 }}>
          {sub}
        </div>

        {/* Match summary */}
        <div style={{ width: "100%", marginTop: 14, padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <Stat lbl="X-mark" v="2" color="var(--x-chalk)"/>
          <Stat lbl="O-mark" v="1" color="var(--o-cyan)"/>
          <Stat lbl="Length" v="1:14" color="var(--flood-500)"/>
          <Stat lbl="XP" v={youWon ? "+34" : "+8"} color="var(--fg-1)"/>
        </div>
      </div>
      <div style={{ padding: "0 28px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <PitchButton variant="primary" full icon="rematch" onClick={() => go("matchmaking")}>Run it back</PitchButton>
        <PitchButton variant="ghost" full onClick={() => go("home")}>Back to home</PitchButton>
      </div>
    </div>
  );
}

function Stat({ lbl, v, color }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.14em" }}>{lbl}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color, letterSpacing: "0.04em", marginTop: 2 }}>{v}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────
const LB = [
  { rk: 1,   nm: "Rho.Striker", init: "R", w: 218, win: 81, you: false },
  { rk: 2,   nm: "Anya.B",      init: "A", w: 204, win: 78, you: false },
  { rk: 3,   nm: "Marcus_77",   init: "M", w: 197, win: 76, you: false },
  { rk: 4,   nm: "Jules99",     init: "J", w: 189, win: 73, you: false },
  { rk: 5,   nm: "Kai_GG",      init: "K", w: 180, win: 71, you: false },
  { rk: 214, nm: "You",         init: "Y", w:  16, win: 75, you: true  },
];

function LeaderboardScreen({ go }) {
  const [tab, setTab] = useState("global");
  return (
    <div style={{ height: "100%", overflowY: "auto", color: "var(--fg-1)", paddingBottom: 40 }}>
      <TopBar title="Leaderboard" leading={<IconBtn name="back" onClick={() => go("home")}/>}/>
      <div style={{ padding: "0 20px 16px", display: "flex", gap: 8 }}>
        {["global","friends","weekly"].map(k => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "10px 12px", borderRadius: "var(--r-pill)",
            background: tab === k ? "var(--flood-500)" : "var(--surface)",
            color: tab === k ? "var(--pitch-900)" : "var(--fg-2)",
            border: tab === k ? "none" : "1px solid var(--border)",
            fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11, cursor: "pointer",
          }}>{k}</button>
        ))}
      </div>

      {/* Podium */}
      <div style={{ padding: "0 20px 18px", display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 10, alignItems: "end" }}>
        <PodiumCard rk={2} nm="Anya.B" init="A" pts={204} h={92}/>
        <PodiumCard rk={1} nm="Rho.Striker" init="R" pts={218} h={120} top/>
        <PodiumCard rk={3} nm="Marcus_77" init="M" pts={197} h={72}/>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        {LB.slice(3).map(p => (
          <div key={p.rk} style={{
            display: "grid", gridTemplateColumns: "32px auto 1fr auto", gap: 12, alignItems: "center",
            padding: "10px 14px", borderRadius: "var(--r-md)",
            background: p.you ? "rgba(212,255,0,0.08)" : "var(--surface)",
            border: `1px solid ${p.you ? "rgba(212,255,0,0.4)" : "var(--border)"}`,
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: p.you ? "var(--flood-500)" : "var(--fg-3)" }}>#{p.rk}</div>
            <Avatar initial={p.init} size={32}/>
            <div>
              <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: p.you ? "var(--flood-500)" : "var(--fg-1)" }}>{p.nm}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.win}% win</div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: p.you ? "var(--flood-500)" : "var(--fg-1)", letterSpacing: "0.04em" }}>{p.w}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumCard({ rk, nm, init, pts, h, top }) {
  const accent = top ? "var(--flood-500)" : rk === 2 ? "var(--o-cyan)" : "var(--x-chalk)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Avatar initial={init} size={top ? 54 : 42} style={{ border: `2px solid ${accent}`, boxShadow: top ? "var(--glow-flood)" : "none" }}/>
      <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nm}</div>
      <div style={{
        height: h, width: "100%",
        background: top
          ? "linear-gradient(180deg, var(--flood-500) 0%, var(--flood-700) 100%)"
          : "var(--surface)",
        borderRadius: "var(--r-md) var(--r-md) 0 0",
        border: top ? "none" : "1px solid var(--border)",
        display: "grid", placeItems: "center",
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: top ? 36 : 26, color: top ? "var(--pitch-900)" : "var(--fg-1)", letterSpacing: "0.04em", lineHeight: 1 }}>{pts}</div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: -2 }}>#{rk}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function SettingsScreen({ go }) {
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [team, setTeam] = useState("x");
  return (
    <div style={{ height: "100%", overflowY: "auto", color: "var(--fg-1)", paddingBottom: 40 }}>
      <TopBar title="Settings" leading={<IconBtn name="back" onClick={() => go("home")}/>}/>
      <div style={{ padding: "0 20px 8px" }}>
        {/* Profile */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Avatar initial="Y" size={56} team="x" status="online"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em" }}>You_pitch</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Pro Pitch · #214</div>
          </div>
          <Icon name="forward" size={18} color="var(--fg-3)"/>
        </div>
      </div>

      <SectionLabel>Game</SectionLabel>
      <SettingGroup>
        <SettingRow label="Sound effects"  right={<Toggle on={sound}    onChange={() => setSound(!sound)}/>}/>
        <SettingRow label="Haptics"        right={<Toggle on={haptics}  onChange={() => setHaptics(!haptics)}/>}/>
        <SettingRow label="Default team"   right={<TeamPicker value={team} onChange={setTeam}/>}/>
      </SettingGroup>

      <SectionLabel>Account</SectionLabel>
      <SettingGroup>
        <SettingRow label="Friend code" right={<span className="mono" style={{ color: "var(--flood-500)", fontSize: 14 }}>X8K-22M</span>}/>
        <SettingRow label="Privacy" right={<Icon name="forward" size={16} color="var(--fg-3)"/>}/>
        <SettingRow label="Notifications" right={<Icon name="forward" size={16} color="var(--fg-3)"/>}/>
      </SettingGroup>

      <div style={{ padding: "20px" }}>
        <PitchButton variant="ghost" full onClick={() => go("splash")}>Sign out</PitchButton>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ padding: "20px 22px 8px", fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 11, color: "var(--fg-3)" }}>{children}</div>
  );
}
function SettingGroup({ children }) {
  return (
    <div style={{ margin: "0 20px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>{children}</div>
  );
}
function SettingRow({ label, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 15 }}>{label}</span>
      {right}
    </div>
  );
}
function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? "var(--flood-500)" : "var(--pitch-600)",
      border: "none", position: "relative", cursor: "pointer", padding: 0,
      transition: "background 220ms",
    }}>
      <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 22, height: 22, borderRadius: "50%", background: "white", transition: "left 220ms var(--ease-pop)" }}/>
    </button>
  );
}
function TeamPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--pitch-600)", borderRadius: "var(--r-pill)", padding: 3 }}>
      {["x","o"].map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          width: 34, height: 30, borderRadius: 999,
          background: value === t ? "var(--pitch-900)" : "transparent",
          border: "none", display: "grid", placeItems: "center", cursor: "pointer",
          boxShadow: value === t ? (t === "x" ? "var(--glow-x)" : "var(--glow-o)") : "none",
        }}>
          {t === "x" ? <XMark size={18}/> : <OMark size={18}/>}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, {
  SplashScreen, HomeScreen, FriendsScreen, MatchmakingScreen,
  LevelsScreen, BoardScreen, GameOverScreen, LeaderboardScreen, SettingsScreen,
});

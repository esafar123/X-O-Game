// PitchUI.jsx — Core components for the Pitch X&O mobile UI kit.
// All components consume CSS vars from ../../colors_and_type.css

// ─────────────────────────────────────────────────────────────
// Icon — inline lucide-style SVGs (2px stroke)
// ─────────────────────────────────────────────────────────────
const ICONS = {
  back:    <path d="M19 12H5M11 18l-6-6 6-6"/>,
  forward: <path d="M5 12h14M13 6l6 6-6 6"/>,
  close:   <path d="M6 6l12 12M6 18L18 6"/>,
  search:  <g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></g>,
  trophy:  <g><path d="M5 4h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 4z"/><path d="M9 4V2h6v2"/></g>,
  bolt:    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  star:    <polygon points="12 2 15 9 22 9.5 16.5 14 18 21 12 17 6 21 7.5 14 2 9.5 9 9"/>,
  clock:   <g><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></g>,
  friends: <g><circle cx="9" cy="8" r="4"/><path d="M2 22a7 7 0 0114 0"/><circle cx="17" cy="8" r="3"/><path d="M14 22a5 5 0 018-4"/></g>,
  settings:<g><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.5-2.5l2-1.5-2-3.5-2.5 1a7 7 0 00-2-1L13 2h-2l-1 2.5a7 7 0 00-2 1l-2.5-1-2 3.5 2 1.5A7 7 0 005 12c0 .9.2 1.7.5 2.5l-2 1.5 2 3.5 2.5-1c.6.4 1.3.7 2 1l1 2.5h2l1-2.5c.7-.3 1.4-.6 2-1l2.5 1 2-3.5-2-1.5c.3-.8.5-1.6.5-2.5z"/></g>,
  play:    <polygon points="6 3 20 12 6 21 6 3"/>,
  lock:    <g><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></g>,
  plus:    <path d="M12 5v14M5 12h14"/>,
  more:    <g><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></g>,
  home:    <g><path d="M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z"/></g>,
  rematch: <g><path d="M21 12a9 9 0 11-3.5-7.1"/><polyline points="21 3 21 9 15 9"/></g>,
  swords:  <g><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/><path d="M9.5 14.5L21 3h-3L6.5 14.5"/></g>,
  volume:  <g><polygon points="3 9 7 9 12 4 12 20 7 15 3 15"/><path d="M16 8a5 5 0 010 8"/></g>,
};

function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round"
         style={style}>
      {ICONS[name] || null}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// XMark / OMark — the tic-tac-toe pieces
// ─────────────────────────────────────────────────────────────
function XMark({ size = 60, glow = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
         style={{ filter: glow ? "drop-shadow(0 0 12px rgba(255,255,255,0.6))" : "none" }}>
      <path d="M22 22 L78 78 M78 22 L22 78" stroke="#ffffff" strokeWidth="11" strokeLinecap="round"/>
    </svg>
  );
}
function OMark({ size = 60, glow = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
         style={{ filter: glow ? "drop-shadow(0 0 12px rgba(0,229,255,0.6))" : "none" }}>
      <circle cx="50" cy="50" r="28" stroke="#00e5ff" strokeWidth="11"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
function PitchButton({ children, variant = "primary", onClick, disabled = false, full = false, icon, iconRight, style = {} }) {
  const base = {
    fontFamily: "var(--font-headline)", fontWeight: 800, textTransform: "uppercase",
    letterSpacing: "0.06em", fontSize: 14,
    padding: "14px 22px", borderRadius: "var(--r-md)",
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.4 : 1,
    transition: "transform 120ms var(--ease-out), box-shadow 120ms var(--ease-out)",
  };
  const variants = {
    primary:   { background: "var(--flood-500)", color: "var(--pitch-900)", boxShadow: "var(--shadow-pop)" },
    secondary: { background: "transparent", color: "var(--fg-1)", border: "1.5px solid var(--border-strong)" },
    ghost:     { background: "var(--surface)", color: "var(--fg-1)" },
    danger:    { background: "var(--x-chalk)", color: "white" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={16}/>}
      {children}
      {iconRight && <Icon name={iconRight} size={16}/>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────
function Avatar({ initial = "?", size = 44, team, status, style = {} }) {
  const teamColor = team === "x" ? "var(--x-chalk)" : team === "o" ? "var(--o-cyan)" : "var(--fg-1)";
  return (
    <div style={{
      width: size, height: size, borderRadius: "var(--r-pill)",
      background: "var(--pitch-600)",
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-headline)", fontWeight: 800,
      fontSize: size * 0.4, color: teamColor,
      position: "relative", flexShrink: 0,
      border: team ? `2px solid ${teamColor}` : "none",
      boxShadow: team === "x" ? "var(--glow-x)" : team === "o" ? "var(--glow-o)" : "none",
      ...style,
    }}>
      {initial}
      {status && (
        <span style={{
          position: "absolute", bottom: 0, right: 0,
          width: 12, height: 12, borderRadius: "50%",
          border: "2px solid var(--pitch-800)",
          background: status === "online" ? "var(--win)" : status === "busy" ? "var(--warn)" : "var(--fg-4)",
          boxShadow: status === "online" ? "0 0 6px var(--win)" : "none",
        }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────
function Badge({ children, tone = "default", style = {} }) {
  const tones = {
    default: { background: "var(--surface)", color: "var(--fg-1)", border: "1px solid var(--border)" },
    flood:   { background: "var(--flood-500)", color: "var(--pitch-900)" },
    live:    { background: "var(--eliminate)", color: "white" },
    win:     { background: "rgba(74,222,128,0.15)", color: "var(--win)", border: "1px solid rgba(74,222,128,0.4)" },
    loss:    { background: "rgba(255,46,77,0.15)", color: "var(--loss)", border: "1px solid rgba(255,46,77,0.4)" },
    draw:    { background: "rgba(240,255,90,0.12)", color: "var(--draw)", border: "1px solid rgba(240,255,90,0.4)" },
    teamX:   { background: "rgba(255,255,255,0.10)", color: "var(--x-chalk)", border: "1px solid rgba(255,255,255,0.30)" },
    teamO:   { background: "rgba(0,229,255,0.15)", color: "var(--o-cyan)", border: "1px solid rgba(0,229,255,0.4)" },
  };
  return (
    <span style={{
      fontFamily: "var(--font-headline)", fontWeight: 800,
      textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11,
      padding: "5px 10px", borderRadius: "var(--r-pill)",
      display: "inline-flex", alignItems: "center", gap: 6,
      ...tones[tone], ...style,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// TopBar — page header used inside the iOS frame body
// ─────────────────────────────────────────────────────────────
function TopBar({ title, leading, trailing, subtitle }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "8px 20px 14px", gap: 12,
    }}>
      <div style={{ width: 36, display: "flex", justifyContent: "flex-start" }}>{leading}</div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-headline)", fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "0.08em",
          fontSize: 13, color: "var(--fg-2)",
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.12em",
            marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>{trailing}</div>
    </div>
  );
}

function IconBtn({ name, onClick, color = "var(--fg-1)" }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, border: "none",
      background: "var(--surface)", borderRadius: "var(--r-pill)",
      display: "grid", placeItems: "center", cursor: "pointer", color,
    }}>
      <Icon name={name} size={18}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// TimerRing
// ─────────────────────────────────────────────────────────────
function TimerRing({ value, total = 15, size = 80, danger = false, label }) {
  const r = 36;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - value / total);
  const color = danger ? "var(--eliminate)" : "var(--flood-500)";
  const glow = danger ? "rgba(255,46,77,0.6)" : "rgba(212,255,0,0.6)";
  return (
    <div style={{ width: size, height: size, position: "relative", display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 80 80" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
                strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${glow})`, transition: "stroke-dashoffset 1s linear" }}/>
      </svg>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: size * 0.42, color,
        letterSpacing: "0.04em", lineHeight: 1,
      }}>{value}</div>
      {label && (
        <div style={{ position: "absolute", bottom: -22, left: 0, right: 0, textAlign: "center",
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)",
          textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Background — pitch stripes utility
// ─────────────────────────────────────────────────────────────
const PITCH_BG = {
  background: `
    radial-gradient(ellipse at 50% -10%, rgba(212,255,0,0.10), transparent 55%),
    repeating-linear-gradient(90deg, var(--pitch-800) 0px, var(--pitch-800) 30px, var(--pitch-700) 30px, var(--pitch-700) 60px)
  `,
};

// ─────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────
function Logo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="29" stroke="#d4ff00" strokeWidth="3"/>
      <path d="M18 18 L46 46 M46 18 L18 46" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round"/>
      <circle cx="32" cy="32" r="12" stroke="#00e5ff" strokeWidth="3.5"/>
    </svg>
  );
}

Object.assign(window, {
  Icon, XMark, OMark, PitchButton, Avatar, Badge,
  TopBar, IconBtn, TimerRing, PITCH_BG, Logo,
});

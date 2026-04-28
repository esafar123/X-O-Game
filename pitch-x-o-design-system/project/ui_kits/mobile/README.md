# Pitch — Mobile UI Kit

Click-through prototype of the Pitch X&O mobile app. Open `index.html` to play through every screen.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Click-through prototype (uses iOS frame; nav buttons let you jump to any screen) |
| `ios-frame.jsx` | iOS device chrome (status bar, dynamic island, home indicator) |
| `PitchUI.jsx` | Core components — Icon, XMark, OMark, PitchButton, Avatar, Badge, TopBar, IconBtn, TimerRing, Logo |
| `Screens.jsx` | All screens — Splash, Home, Friends, Matchmaking, Levels, Board, GameOver, Leaderboard, Settings |

## Screen flow

```
Splash → Home ┬─ Friends ─┐
              ├─ Matchmaking ─→ Board ─→ GameOver ─→ Home
              ├─ Leagues ────┤
              ├─ Leaderboard
              └─ Settings
```

## Color rules in this kit

- **X mark = chalk white** (home team)
- **O mark = cyan** (away team)
- **Floodlight yellow** = primary CTA, active player accents
- **Red = elimination only** — the losing player's panel on Game Over (never on team chrome)

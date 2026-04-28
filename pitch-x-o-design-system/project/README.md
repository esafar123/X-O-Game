# Pitch X&O — Design System

> **Pitch** is an esports-flavored, sport-themed take on tic-tac-toe (X&O). Two players face off on a glowing dark "pitch" with a live timer, score, online friends, and laddered difficulty. Think *Rocket League meets a Sunday-afternoon pickup match.*

This repo is a self-contained **design system + UI kit** for the Pitch mobile app.

---

## Index

| File / Folder | What's in it |
| --- | --- |
| `README.md` | This file — brand, content, visual + iconography rules |
| `SKILL.md` | Agent-Skill manifest so this can be lifted into Claude Code |
| `colors_and_type.css` | All design tokens (colors, type, spacing, radii, shadows, easings) |
| `assets/` | Logo, logomark, X/O marks, ball, trophy, whistle SVGs |
| `fonts/` | (No local files — fonts loaded from Google Fonts; see Typography) |
| `preview/` | The cards that populate the **Design System** tab |
| `ui_kits/mobile/` | Full mobile UI kit + click-through prototype (`index.html`) |
| `slides/` | Sample 16:9 deck slides using the brand |

---

## Sources & inputs

This system was created **from scratch** based on a brief: an X&O game with a **sporty / esports** vibe, **pitch-green / white / yellow** palette, **mobile**. No existing codebase, Figma, or brand assets were provided. Every visual decision below is therefore an opinionated proposal — please flag anything that's off.

---

## Brand in one paragraph

Pitch is the **floodlit night-game** of tic-tac-toe. The pitch is dark grass under stadium lights. White chalk lines mark the field. A single neon-yellow accent (`--flood-500`) is the spotlight — used sparingly, like a key light on the action. The home team is **X (red)**, the away team is **O (cyan)**. Numbers — timers, scores, league standings — get a chunky monospaced scoreboard treatment. Headlines are condensed and shouty. Body copy is calm and fast. The product feels like *the moment before kick-off:* tight, electric, ready.

---

## Content fundamentals

**Tone — pumped sports broadcaster, never sleazy.** Short. Confident. Active voice. Imagine a stadium PA announcer who genuinely cares.

**Voice rules**

- **Casing** — `UPPERCASE` for display headlines, scores, level names, button labels. `Sentence case` for body copy and hints. Never Title Case.
- **Person** — second person ("you", "your move") to the player; third person for the opponent ("Marcus is thinking…").
- **Length** — system messages ≤ 6 words. Toasts ≤ 8 words. Empty states ≤ 12 words.
- **Numbers** — always digits, never spelled out. `3-1`, not "three to one". Always with separators in scoreboards (`12W · 3L · 1D`).
- **No emoji** in product UI. The X, O, lightning bolt, ball, and trophy SVGs already carry the energy. (Emoji is OK in marketing copy / push-notification fallback only.)
- **No exclamation marks in serious states** (loss, error, low-bandwidth). Save them for wins and level-ups, max one per message.

**Vocabulary**

| Use | Don't use |
| --- | --- |
| Match, round, fixture | Game, session |
| Pitch | Board, grid (in user-facing copy) |
| Mark | Move, play |
| Roster, friends | Contacts, users |
| League | Difficulty, level (in user-facing copy) |
| Kick-off | Start |
| Full time | Game over |

**Sample copy**

- Splash: `READY UP.`
- Empty roster: `No teammates yet. Invite a friend to warm up.`
- Your turn: `YOUR MARK` (display) · `Make it count.` (subtitle)
- Their turn: `MARCUS IS THINKING` · `0:08`
- Win: `FULL TIME — YOU WIN`
- Loss: `Full time. Marcus took it 2-1.`
- Draw: `STALEMATE.` · `Run it back?`
- Level locked: `Win 3 in the Sunday League to unlock.`

---

## Visual foundations

### Color

The palette is anchored on a deep **pitch green/black**, painted with **chalk white** markings, lit by a single **neon-yellow floodlight**. Two team colors — **red (X)** and **cyan (O)** — only ever appear on the marks themselves and on team-owned UI (their score chip, their turn indicator).

| Role | Token | Hex | Usage |
| --- | --- | --- | --- |
| Background | `--pitch-800` | `#0a1612` | Default app background |
| Surface | `--pitch-700` | `#0f211b` | Cards, sheets |
| Elevated | `--pitch-600` | `#14302a` | Modals, popovers |
| Accent | `--flood-500` | `#d4ff00` | Primary CTA, key numbers, focus glow |
| Team X | `--x-chalk` | `#ffffff` | The X mark, X player chrome |
| Team O | `--o-cyan` | `#00e5ff` | The O mark, O player chrome |
| Eliminate | `--eliminate` | `#ff2e4d` | **Reserved.** Loss / elimination only — never on team or brand. |
| Text 1 | `--chalk-100` | `#ffffff` | Primary text |
| Text 2 | `--chalk-300` | `#d9e0d4` | Secondary text |
| Text 3 | `--chalk-400` | `#9aa89a` | Meta, timestamps |

**Rule of thumb:** any one screen uses **one** team color at a time as a hero (whoever's turn it is) — never both screaming together. The floodlight yellow is *the* CTA color and should appear at most twice per screen.

**Red = elimination, full stop.** The losing player's avatar, mark, and panel turn red on the game-over screen, indicating they must leave the match. Red never appears on team chrome, brand marks, badges, or branding outside of that elimination state. Team X is **chalk white** (the home team's kit); Team O is **cyan**.

### Typography

Loaded from Google Fonts. **No local font files** are bundled — flag this if offline support is required.

| Family | Role | Notes |
| --- | --- | --- |
| **Bebas Neue** | Display, scoreboard | All-caps, ultra-condensed. Used for big numbers and hero titles. |
| **Barlow Condensed** | Headlines, labels | 700–800 weight. Athletic, slightly italic for action. |
| **Barlow** | Body, UI labels | 400/500/600/700. Calm and legible. |
| **JetBrains Mono** | Timers, scores, stats | Tabular numerals for clocks and numbers that change. |

**Substitution flag** — Bebas Neue + Barlow are the closest open-source matches to the "Eurostile / DIN / varsity" feel. If you have licensed display fonts (e.g. *Druk*, *Heading Pro*, custom varsity), drop them in `fonts/` and update `colors_and_type.css`.

### Spacing & layout

4-pt grid. Tokens: `--s-1`…`--s-16`. Mobile screen padding is `var(--s-5)` (20px) edges. Cards use `var(--s-4)`–`var(--s-5)` internal padding.

### Radii

- `--r-sm` (8) — chips, small inputs
- `--r-md` (12) — buttons, fields
- `--r-lg` (18) — cards
- `--r-xl` (28) — sheets, modals, board cells
- `--r-pill` — score chips, status pills, avatars

### Shadows & elevation

- `--shadow-2` for cards (deep, dark, with a 1px inner top highlight to fake a screen edge)
- `--shadow-3` for sheets and modals
- `--shadow-pop` — an athletic 8px hard offset, used on primary CTAs to give a "trading-card" punch
- **Glow shadows** (`--glow-flood`, `--glow-x`, `--glow-o`) — used on the active board cell, the running timer ring, and the current player avatar. **Never** layer two glows in one composition.

### Backgrounds

- Default: solid `--pitch-800`.
- **Pitch backdrop** (`.pitch-bg` utility): subtle 40px-wide grass stripes (`--pitch-700`/`--pitch-800`) with a soft yellow vignette from the top — used on splash, home, and game-over screens. **Not used** on dense list screens (friends, leaderboard) — they stay flat.
- No big photographic imagery. No AI-art textures. Stripes + glows do the heavy lifting.

### Borders & lines

- **Chalk line** = 1px `rgba(255,255,255,0.10)` for separators.
- **Strong border** = 1.5px `rgba(255,255,255,0.22)` on focused inputs, selected cards.
- Board grid lines are 2px white at 70% opacity — they're the white chalk on the pitch.

### Animation

- **Easing** — `--ease-out` for entrances, `--ease-pop` (overshoot) for marks landing on the board, `--ease-in` for exits. Linear is forbidden except for timer rings.
- **Durations** — 120ms for hover/press feedback, 220ms for screen transitions, 420ms for celebrations.
- **Mark drop** — when a player places an X or O, it scales from 0.6 → 1.05 → 1 with `--ease-pop` and the team-glow fades from 100% → 30% over 600ms.
- **Win line** — animated 600ms stroke-dash draw across the three winning cells in `--flood-500`.
- **No fancy parallax. No gratuitous spring physics. No page-load hero animations.**

### Hover & press states

- **Hover** (web only) — surfaces lift `translateY(-2px)` and gain `--glow-flood` at 40% strength on primary, `border-color: --border-strong` on secondary.
- **Press** — `transform: translateY(2px) scale(0.98)`, `--shadow-pop` collapses to 0. Feels like physically pushing a card.
- **Disabled** — opacity 0.4, no glow, cursor `not-allowed`.

### Transparency & blur

Used sparingly. Only on:
- Modal scrim — `rgba(5, 10, 8, 0.72)` with `backdrop-filter: blur(8px)`.
- Match-found overlay — same recipe.
- Glassy score chips on the game board — `rgba(255,255,255,0.06)` + 1px chalk border + `backdrop-filter: blur(6px)`.

### Imagery

No photographic imagery. If imagery is ever added, it should be **high-contrast b&w** (think sports photojournalism) tinted with the floodlight yellow at 20% — never warm tones, never gradients-from-purple-to-pink.

---

## Iconography

**System: Lucide** ([lucide.dev](https://lucide.dev)) — loaded from CDN. Lucide's 2px stroke, sharp-corner aesthetic matches the chalk-line / scoreboard feel.

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
```

Then in JSX: `<i data-lucide="trophy"></i>` after a `lucide.createIcons()` call. The mobile UI kit uses inline SVGs lifted from Lucide so they render without the runtime.

**Stroke weight** — always 2px. **Size scale** — 16, 20, 24, 28. Default 20.

**Custom brand SVGs** (live in `assets/`, hand-authored, on-brand):

- `logo.svg` — wordmark + mark, 240×64
- `logomark.svg` — mark only, 64×64 (use as app icon)
- `x-mark.svg` — the X, in `--x-red`
- `o-mark.svg` — the O, in `--o-cyan`

**Never** use emoji in the product UI (see Content Fundamentals). **Unicode symbols** — only `·` for separators in meta lines and `→` for forward navigation. Everything else is a Lucide SVG.

---

## What needs your input

1. **Real fonts** — confirm Bebas Neue + Barlow are OK, or send licensed equivalents.
2. **Real logo** — `assets/logo.svg` is a placeholder mark. Send a final lockup if you have one.
3. **Mascot or hero illustration** — none drawn. The brand is currently typographic + geometric only. Tell me if you want a mascot (a cartoon ref, a pitch-side coach, etc) and I'll wireframe it.
4. **Sound design** — out of scope for this pass, but heavily implied by the aesthetic. Note for later.

---
name: pitch-design
description: Use this skill to generate well-branded interfaces and assets for Pitch — an esports-themed X&O (tic-tac-toe) mobile game with a dark stadium / floodlight aesthetic. Use it for production code or for throwaway prototypes, mocks, slides, and presentations. Contains essential design guidelines, color and type tokens, fonts, asset SVGs, and a full mobile UI kit.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `ui_kits/mobile/`, `slides/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always import `colors_and_type.css` so the brand tokens are available, and lift JSX components from `ui_kits/mobile/` rather than re-implementing them.

If working on production code, you can copy assets and read the rules in `README.md` to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few questions (platform, scope, screens, copy tone within the Pitch tone-of-voice), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

**Non-negotiables**

- Dark backgrounds only. Pitch is a night-game.
- Floodlight yellow (`--flood-500`) is the only CTA color. Use sparingly — at most twice per screen.
- One team color per screen as a hero. Never red and cyan screaming together.
- No emoji in product UI. Use Lucide icons.
- Headlines are UPPERCASE Bebas Neue or Barlow Condensed. Body is sentence-case Barlow.
- Numbers (timers, scores) always use JetBrains Mono, tabular.

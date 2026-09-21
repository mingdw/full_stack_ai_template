---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web, mobile, and desktop. Use when designing, building, reviewing, or fixing interfaces — layout, typography, color, accessibility, interaction, and stack-specific UI. Full searchable CSV database ships with upstream nextlevelbuilder/ui-ux-pro-max-skill; this project copy captures the decision workflow and priority checks."
---

# UI/UX Pro Max (project workflow copy)

Upstream: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

When network allows, prefer installing the full package:

```bash
npx --yes uipro-cli@latest init --ai cursor
```

That adds searchable data + `scripts/search.py`. Until then, follow this workflow.

## When to Apply

UI structure, visual design, interaction, accessibility, typography, color, responsive layout, animation quality. Skip pure backend / infra work.

## Priority Checklist (1 → 10)

1. **Accessibility** — contrast ≥ 4.5:1, keyboard focus, labels / aria
2. **Touch & Interaction** — ≥44px targets, 8px+ gaps, loading feedback
3. **Performance** — no layout thrash; reserve space
4. **Style Selection** — match product type; SVG icons (no emoji icons)
5. **Layout** — coherent breakpoints; no accidental horizontal scroll
6. **Typography & Color** — base ≥16px body where possible; semantic tokens
7. **Animation** — meaning-bearing motion; prefer transform/opacity; honor `prefers-reduced-motion`
8. **Forms** — visible labels; errors near fields; progressive disclosure
9. **Navigation** — predictable back; clear current place
10. **Charts** — only when relevant

## Design System Shortcut (no search CLI)

For a product page, declare before coding:

- **Product type** (tool / SaaS / vault / landing…)
- **Audience**
- **Style keywords** (playful-trust, soft, calm…)
- **Palette** (one accent; no AI purple chrome)
- **Type pairing**
- **Motion budget**
- **Anti-patterns to avoid**

## Password-vault / desktop auth defaults

- Trust-first, calm surfaces; warm neutrals over cool slate
- Single deep ink/teal accent for primary actions
- Progressive disclosure on setup/restore (one primary field per step)
- Keep playful mascots as brand, not as UI chrome purple gradients
- Focus rings always visible; password show/hide needs a real button label

## Pre-delivery

- [ ] cursor-pointer on clickable controls
- [ ] hover + active + focus states
- [ ] errors inline near fields
- [ ] no placeholder-only labels
- [ ] reduced-motion safe

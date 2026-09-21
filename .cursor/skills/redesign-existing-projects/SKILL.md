---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## How This Works

When applied to an existing project, follow this sequence:

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. **Diagnose** — Run through the audit below. List every generic pattern, weak point, and missing state you find.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do not rewrite from scratch. Improve what's there.

## Design Audit

### Typography
- Replace browser default / Inter / Segoe-only stacks with a font that has character (Geist, Outfit, Plus Jakarta Sans, DM Sans).
- Increase display presence; use Medium/SemiBold; tighten large headlines; use `text-wrap: balance`.

### Color and Surfaces
- Avoid pure `#000` / AI purple-blue gradients / oversaturated accents.
- One accent color; tinted shadows; subtle grain or ambient gradient depth.
- Keep warm OR cool gray family consistently.

### Layout
- Break forced centering when the product needs a split (e.g. auth: mascot | form).
- Vary border-radius; breathe with whitespace; optical alignment over pure math.

### Interactivity
- Hover / active / focus / loading / empty / error states required.
- Prefer `transform` + `opacity`; 200–300ms transitions; respect reduced motion.

### Fix Priority
1. Font swap  2. Color cleanup  3. Hover/active  4. Layout/spacing  5. Generic component swap  6. States  7. Typography polish

## Rules
- Work with the existing stack. Do not migrate frameworks.
- Do not break functionality. Keep changes reviewable and focused.

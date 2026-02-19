# Design Notes – Token Mapping

This document maps PetMat’s design system to existing CSS variables in `src/styles/theme.css`.

- Update colors:
  - `--primary: #0F766E` (teal 600), `--primary-foreground: #FFFFFF`
  - `--secondary: #F59E0B` (amber 500), `--secondary-foreground: #0F172A`
  - `--muted: #F3F4F6`, `--accent: #E5E7EB`
  - `--destructive: #EF4444`, `--destructive-foreground: #FFFFFF`
  - Add (optional): `--success: #22C55E`, `--info: #3B82F6`
- Radius:
  - `--radius`: set to `12px`; use `--radius-sm`, `--radius-md`, `--radius-lg` already mapped.
- Shadows:
  - Use utility classes or add custom CSS classes: `.shadow-1`, `.shadow-2`, `.shadow-3` with the values in the spec.
- Typography:
  - Ensure Inter is loaded in `fonts.css`. Apply sizes via Tailwind (`text-2xl`, `text-xl`, etc.), aligned to base `16px` in `html` already controlled by `--font-size`.
- Accessibility:
  - Confirm focus outlines use `--ring`; if needed, increase contrast for better visibility.

Implementation is non-breaking because Tailwind maps to `@theme inline` variables; the new values slot directly into existing tokens.

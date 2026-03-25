---
title: Northglenn Website Build
updated: March 2026
hidden: true
parent: recent_projects
---
## File Architecture
- **Kepano base retained** — Minimal Publish CSS kept as the foundation for both sites rather than rewriting from scratch. The kepano base handles cards, image grid, dataview compatibility, table edge padding, tag styling, mobile breakpoints, and lightbox hooks; rewriting risked regressions in features not actively being tested.
- **Token-based theming adopted** — All color differentiation between sites is achieved by swapping CSS variables in `.theme-light` and `.theme-dark` blocks only. Structural rules (heading weights, spacing, layout, components) are byte-for-byte identical across both sites, so either layer can evolve independently.
- **Layering model established** — kepano base → color token overrides → custom structural additions at the bottom of the file.
---
## publish.js
- **No changes made** — JS left unchanged across both sites. The two features (image lightbox with keyboard/swipe navigation, enlarged hover previews with viewport boundary detection) are purely behavioral with no color or identity dependency.
- **JS spacing fix rejected** — Using JS to remove empty `<p>` elements between H2 headings and lists was considered and rejected; Obsidian uses those elements intentionally in some contexts, so a global removal risked collapsing spacing in unintended places. Solved with CSS negative margin instead.
---
## Color System
- **Hue rotation as primary differentiation** — Sister site colors derived by rotating the original accent hue (`--accent-h: 212`, blue) rather than picking an unrelated palette. Rotation preserves saturation and lightness relationships so both sites feel like they come from the same design hand.
- **Saturation reduced for warm hues** — `--accent-s` dropped from 100% to 72–75% for amber and rose candidates. Blue at 100% saturation reads as professional; warm hues at full saturation on white read as aggressive.
- **H3 color hardcoding identified** — The kepano base sets `--h3-color: var(--color-cyan)` unconditionally; H3 does not automatically follow accent changes. Fixed on the sister site by defining a new custom token in the shared `.theme-dark, .theme-light` block with a scoped dark-mode override rule using `!important` at the bottom of the file.
- **Hex opacity suffix bug found and fixed** — Earlier attempts used hex opacity suffixes on link colors (e.g. `#4a7c9e99`) which muted links to an unacceptable gray-blue. All light mode link colors reverted to full opacity values with no suffix.

### Hue rotation candidates evaluated

| Rotation | Hue | Result | Verdict |
|---|---|---|---|
| +120° | 332° | Rose/Pink | Too aggressive at 100% sat |
| +150° | 2° | Red-Orange | Viable but loud |
| +180° | 32° | Amber | Strong editorial feel |
| −60° | 252° | Slate Violet | Good dark mode, too close to original in light mode |
---
## Final Palette Selected: Graphite & Steel
- **Light mode — slate tint** — Cool blue-gray tinted backgrounds (`--bg1: #edf1f5`) rather than neutral white. Sidebar pushed further blue (`--bg2: #d4dce6`) to create clear left/right atmospheric contrast even before any link colors are read.
- **Dark mode — blue charcoal** — Background shifted to `#161b1f` rather than the original neutral `#1e1e1e`. Creates a cooler, more architectural feel and immediately distinguishes the two sites in dark mode.
- **Dual H3 color** — Light mode H3 is teal (`#4a9490`), dark mode H3 is goldenrod (`#c8922a`). Handled via the single `--h3-color` token set to teal in the shared block, with an explicit `.theme-dark h3` override rule at the bottom of the file.

### Light mode tokens

| Token | Value | Notes |
|---|---|---|
| `--bg1` | `#edf1f5` | Main content — cool blue-gray tint |
| `--bg2` | `#d4dce6` | Sidebar — pushed further blue |
| `--bg3` / `--ui1` | `#c0cad4` | Borders and dividers |
| `--tx1` | `#1a2028` | Cool near-black body text |
| `--tx2` | `#7a8898` | Cool muted text |
| `--ax1` | `#1e5080` | Deep navy — full opacity |
| `--hl1` | `#d8e4ef` | Cool blue selection highlight |
| H3 | `#4a9490` | Teal |

### Dark mode tokens

| Token | Value | Notes |
|---|---|---|
| `--bg1` | `#161b1f` | Blue-charcoal |
| `--bg2` | `#1e252b` | Cooler sidebar |
| `--ax1` | `#5b9ab8` | Steel-blue — brightened for dark bg legibility |
| `--hl1` | `#1e3240` | Deep steel-blue selection |
| H3 | `#c8922a` | Goldenrod — warm contrast on cool dark |
---
## Structural Additions (Both Sites)
- **Sidebar width reduced** — Default Publish sidebar (~280px) overridden to 220px via `!important` (required because Publish sets width inline). Nav padding tightened to `1rem 0.75rem`.
- **Sidebar logo sizing** — `max-height: 40px` rule added to constrain logo once injected by Publish. No JS required; logo source is set natively in Obsidian → Publish → Change site options.
- **Homepage subtitle styled** — No native subtitle field exists in Obsidian Publish. The first `<p>` inside the homepage note is targeted with a `data-path="Home"` selector and styled at `1.25em`, weight 300, using `--tx2`. Replace `"Home"` with the exact homepage filename (case-sensitive, no `.md` extension).
- **H2 → list spacing fixed** — Obsidian Publish wraps content in `<div>` elements between headings and lists, blocking CSS sibling selectors (`h2 + ul`). Solved with `margin-bottom: -0.4em !important` on H2, pulling whatever follows upward regardless of wrapper elements. Lists get `margin-top: 0` and `margin-bottom: 1.2em` for asymmetric spacing — tight above (belongs to the heading), generous below (separates from the next section).
---
## Variants Explored, Not Shipped

| Variant | Reason not chosen |
|---|---|
| Full CSS rewrite | Kepano base provides too much battle-tested component machinery to risk losing |
| Flexoki (orange accent) | Cyan reads as washed-out sage/green on light backgrounds; orange too close to amber candidates already explored |
| Flexoki v2/v3 (cyan accent) | Background feel too similar to original site |
| Amber / terracotta light mode | Warm hues on cool-neutral dark backgrounds create tension; amber reads as "warning" in dark mode |
| Slate violet | Light mode violet needed 55% desaturation and still read too close to the original blue |
| JetBrains Mono as body font | Viable for technical sites; may feel dense at 16px for long-form prose — worth retesting at 15px |
---
## Files Produced

| File | Description |
|---|---|
| `publish-graphite-steel-v2.css` | Primary output — Graphite & Steel, slate tint light / blue charcoal dark |
| `publish-slate-violet.css` | Slate violet variant (252°, 55% sat) |
| `publish-terracotta.css` | Atlantic/NYT editorial terracotta variant |
| `publish-flexoki.css` | Flexoki, orange accent |
| `publish-flexoki-v2.css` | Flexoki, cyan accent, neutral warm-white backgrounds |
| `publish-flexoki-v3.css` | Flexoki, cyan-400 accent, slightly cooler backgrounds |
---
## Known Issues / Future Considerations
- **CSS structural bug in kepano base** — `h1, h2, h3` and `h2` blocks are opened inside `body {}` before CSS variables are declared. Browsers recover gracefully but it is technically malformed. Worth fixing if the file is ever rewritten from scratch.
- **Style Settings values don't transfer** — In-app Style Settings customizations must be manually translated into `publish.css` variables to appear on the published site.
- **Dark/light mode** — The toggle set in the Obsidian app does affect the published site via `.theme-dark` / `.theme-light` class application. All other in-app appearance settings do not carry over.

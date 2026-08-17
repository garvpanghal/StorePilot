# Changelog

## 2.1.0 — Mobile Layout + AI Assistant UX Pass (Milestone 4b) — 2026-08-13

### Mobile Layout (375px / 390px)
- **Zero horizontal overflow**: `document.documentElement.scrollWidth === clientWidth` verified at 375/390px.
- **Sidebar drawer**: 280px (≤800px) → 260px (≤420px) → 240px (≤375px), backdrop, smooth transform.
- **Topbar search collapse**: Input hidden at ≤390px (icon-only); all controls fit viewport.
- **Dashboard single column**: All grids collapse to 1fr; KPI stats 2-col (1-col ≤420px).
- **Chart heights**: 240→200→180→160→150px by breakpoint.
- **Tables**: Internal horizontal scroll only (`.tableWrap overflow-x:auto`), `min-width:560px` at 375px.
- **Spacing**: Page padding 40→32→18→16→14px; gap 18→14→12→10px.
- **Typography scaling**: `pageTitle` 1.95→1.6→1.45→1.35rem; KPI values scale down.

### AI Assistant — Desktop
- **Reveal button**: Fixed right-edge pill (vertical center), sparkle icon + "AI Assistant" label, hover slide, purple gradient.
- **Drawer**: Right-side 400px panel, full height, backdrop blur, slide-in animation.
- **Content**: Bot greeting (icon + h2 + p), 5 suggestion chips, input + send button.
- **Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-label="AI Assistant"`, focus trap, Escape/backdrop close, focus restoration.

### AI Assistant — Mobile/Tablet (≤768px)
- **FAB**: Bottom-right floating button (52px→48px→44px), gradient primary→purple, scale hover/active.
- **Drawer**: Reuses desktop component; full viewport height/width on mobile.
- **Reveal hidden**: Desktop reveal button hidden via `@media(max-width:768px)`.

### Animation & Motion
- All transitions CSS-based (200–250ms ease); `prefers-reduced-motion` disables all animations instantly.

---

## 2.0.0 — UI Foundation Polish (Milestone 4) — 2026-08-13

Complete correction pass on the existing UI foundation. No business functionality changed.

### Typography
- Base font-size 15px, line-height 1.6; explicit hierarchy (eyebrow, pageTitle, pageDesc, cardHead, KPI, body, metadata, sidebar nav, table, topbar).
- Weights 400→800 used intentionally; avoided excessive bold.
- Better vertical rhythm; comfortable letter-spacing.

### Dashboard horizontal space
- `.page` now uses full available width after sidebar (`max-width:none`, responsive padding 18–40px).
- Stats grid: 5-col → 4/3/2-col by breakpoint.
- Charts/tables/cards expand to fill available width.

### Logo — Light mode
- `logo-light.png` (376×104) in sidebar at 34px height; aspect preserved; flex lockup with mark.

### Logo — Dark mode
- `logo-dark.png` (409×117) in sidebar; no CSS filters; integrates with dark sidebar.

### Logo wordmark alignment
- Mark + wordmark share 34px height cap; flex gap 10px; visual centers aligned.

### Collapsed sidebar logo
- New mark-only assets: `mark-light.png` (107×104), `mark-dark.png` (104×117) — pure crops from canonical logos.
- Collapsed: wordmark hidden; mark centered at 34px height.

### Collapsed sidebar → content gap
- Single source of truth `--sidebar-w` (set by JS, consumed by sidebar/topbar/main).
- All three transition in sync (.25s ease); no gap, no negative margins.

### Card premium interaction
- `.panel.interactive`: hover lift (-3px), stronger shadow, border transition, 200ms ease.
- Applied to KPI stats (Dashboard) and product cards (Products grid).
- Respects `prefers-reduced-motion`.

### Responsive design
- Verified at 1440/1280/1024/800/420/375px.
- Desktop: full grid, sidebar visible.
- Tablet: reduced columns, typography scales.
- Mobile: drawer sidebar, single-column, scrollable tables, no overflow.

### Topbar
- No logo (moved to sidebar).
- Tracks sidebar via `--sidebar-w`.
- Contains: page title, search, notifications, theme toggle, profile.

### Theme system preserved
- Light/dark tokens, localStorage persistence, inline script no-flash.

### Products page preserved
- No business logic changes; styling updated only (spacing, sizing, alignment).
- All search/filter/sort/CRUD/theme behavior intact.

---

## 1.0.0 — Fresh frontend prototype — 2026-08-09

- Rebuilt StorePilot frontend from scratch in React/Vite.
- Implemented reference-driven application shell.
- Added light green and dark purple theme personalities.
- Added sidebar-only StorePilot branding.
- Added responsive dashboard, Products page and route shells.
- Added mock charts, KPIs, recent sales and AI recommendation UI.
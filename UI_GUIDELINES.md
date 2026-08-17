# StorePilot — UI Guidelines

Brand rules, colour system, component patterns, and conventions for the StorePilot frontend.

---

## 1. Brand identity

### Logo mark

The official StorePilot logo mark fuses a **minimalist storefront** (thick roof + three deep awning scallops + outlined body) with a **growth visualization** (three ascending filled bars + one rising arrow with a solid arrowhead).

- **The brand is shipped as raster PNGs in `frontend/public/assets/`**. Do not recreate, trace, or re-vectorise the artwork. `scripts/crop-mark.mjs` crops mark-only variants from the full logos.
- **Brand colour**: green in light mode (`#13a66a`), purple in dark mode (`#a855f7`) — intentional dual-brand treatment.
- **This mark is LOCKED.** Do not redesign it in any future milestone. Never replace it with a generic basket, cart, storefront, P monogram, chart icon, or icon-library symbol — the fused storefront + growth identity is the brand.
- **Sidebar branding (current architecture)**:
  - **Expanded**: full lockup (`logo-light.png` / `logo-dark.png`) at 34px height, `width:auto`, `object-fit:contain`, `object-position:left center`.
  - **Collapsed**: mark-only (`mark-light.png` / `mark-dark.png`) centered at 34px height; wordmark fully hidden.
  - **No logo in topbar** — topbar is navigation + actions only.
- **Assets generated from canonical sources**: `logo-light.png` / `logo-dark.png` are the source of truth; mark crops are pure pixel crops (no redraw).

### Wordmark

"StorePilot" rendered as part of the logo PNG (baked in):
- **Light mode**: "Store" charcoal (#101828), "Pilot" green (#13a66a).
- **Dark mode**: "Store" light (#e7eaf2), "Pilot" purple (#a855f7).
- Do not attempt to re-draw the wordmark inline — it is part of the canonical PNG lockup.

### Brand assets

| File | Size | Purpose |
|------|------|---------|
| `logo-light.png` | 376×104 | **Canonical light sidebar logo** — full lockup, original colours |
| `logo-dark.png` | 409×117 | **Canonical dark sidebar logo** — full lockup, dark-theme colours |
| `mark-light.png` | 107×104 | **Collapsed sidebar mark (light)** — pure crop of logo-light icon region |
| `mark-dark.png` | 104×117 | **Collapsed sidebar mark (dark)** — pure crop of logo-dark icon region |
| `app-icon.png` | 409×366 | High-res app icon |
| `favicon.png` | 107×98 | Browser favicon (served at `/assets/favicon.png`) |

### Favicon

`favicon.png` is the browser-tab mark derived from the standalone logo mark. Served at `/assets/favicon.png`, linked from `index.html`.

---

## 2. Colour system

All colours live in `src/styles/global.css` as CSS custom properties. Never use raw hex — always reference `var(--*)`.

### Brand colours (dual treatment)

| Token | Light | Dark |
|-------|-------|------|
| `--primary` | `#13a66a` (green) | `#a855f7` (purple) |
| `--primary-soft` | `#e9f8f1` | `#24163f` |
| `--primary-strong` | `#087a4b` | `#c084fc` |

**Light mode is GREEN; dark mode is PURPLE.** This is an intentional brand decision.

### Text colours

| Token | Light | Dark |
|-------|-------|------|
| `--text` | `#101828` | `#f4f6fb` |
| `--muted` | `#667085` | `#98a2b3` |

### Surface colours

| Token | Light | Dark |
|-------|-------|------|
| `--surface` | `#fff` | `#101827` |
| `--surface2` | `#f3f6f7` | `#151e30` |
| `--border` | `#e4e7ec` | `#253148` |

### Shadow tokens

| Token | Light | Dark |
|-------|-------|------|
| `--shadow` | `0 8px 30px rgba(16,24,40,.06)` | `0 10px 34px rgba(0,0,0,.26)` |
| `--shadow-hover` | `0 14px 40px rgba(16,24,40,.12)` | `0 18px 46px rgba(0,0,0,.42)` |

### Semantic colours (Badge / status)

| Variant | Colour |
|---------|--------|
| `success` | green (`#10a66a` light / `#087a4b` dark) |
| `warning` | amber (`#f59e0b`) |
| `danger` | red (`#ef4444`) |
| `info` | blue (`#3b82f6`) |

---

## 3. Typography

- **Font stack**: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (no `@font-face` — system fallback).
- **Base size**: 15px (`font-size:15px` on `:root`); body text renders at `0.933rem` (14px effective).
- **Line-height**: 1.6 (body); tighter for headings (1.1–1.18).
- **Weights**: 400 (body), 500 (sidebar nav), 550 (labels/buttons), 600 (active nav, card headings), 650 (card H2), 700 (page title, KPI values, brand wordmark), 800 (eyebrow, badges, table headers).
- **Letter-spacing**: tight on headings (-0.01 to -0.02em); wide on eyebrow (.14em); slight on table headers (.03em).

### Hierarchy (explicit classes)

| Class | Size | Weight | Line-height | Letter-spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `.eyebrow` | 0.72rem (11.5px) | 800 | — | .14em uppercase | Section/category label |
| `.pageTitle` | 1.95rem (31px) | 700 | 1.18 | -.02em | Page H1 |
| `.pageDesc` | 0.95rem (15px) | 400 | 1.5 | — | Page subtitle |
| `.cardHead h2` | 1rem (16px) | 650 | — | -.01em | Card/section heading |
| `.stat > strong` | 1.5rem (24px) | 700 | 1.1 | -.02em | KPI value |
| `.stat > span` | 0.8rem (13px) | 550 | — | — | KPI label |
| `.stat small` | 0.7rem (11px) | 400 | 1.4 | — | KPI metadata |
| `body` / `.panel` | 0.933rem (15px) | 400 | 1.6 | — | Body text |
| `.navItem` | 0.875rem (14px) | 550 | — | — | Sidebar navigation |
| `th` | 0.72rem (11.5px) | 800 | — | .03em | Table header |
| `td` | 0.85rem (13.5px) | 400 | — | — | Table cell |
| `.topTitle` | 0.95rem (15px) | 600 | — | -.01em | Topbar page title |
| `.search input` | 0.85rem (13.5px) | 400 | — | — | Search input |

**Avoid excessive bold** — reserve 700+ for true emphasis (titles, KPI values, active nav, badges).

---

## 4. Spacing & sizing

All spacing uses responsive tokens in `global.css`:

| Token | Desktop | ≤1280px | ≤800px |
|-------|---------|---------|--------|
| `--space-page` (page padding) | 40px | 32px | 18px |
| `--gap` (grid/card gap) | 18px | 18px | 14px |
| `--sidebar` | 240px | 240px | (drawer) |
| `--sidebar-collapsed` | 72px | 72px | (drawer) |
| `--topbar` | 62px | 62px | 62px |

**Border radius**: `--radius: 16px` (cards, panels, inputs, buttons).
**Shadows**: `--shadow` (resting), `--shadow-hover` (interactive hover).
**Transitions**: `.2s–.25s ease` for layout; `.15s–.2s ease` for hover states.

### Layout metric — single source of truth
- `--sidebar-w` = live sidebar width (CSS custom property).
- Set by `Shell.jsx` `useEffect` on `collapsed` state: 240px / 72px.
- Consumed by: `.sidebar width`, `.topbar left`, `.main margin-left`.
- All three transition in sync (`.25s ease`).

---

## 5. Component patterns

### CSS Modules
- One `.module.css` per component, co-located.
- Class names hashed by Vite — do not query CSS Module classes in tests; use ARIA roles, data attributes, or structural selectors.

### Cards (`.panel`)
```css
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.panel.interactive { cursor: pointer }
.panel.interactive:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
}
.panel.interactive:active { transform: translateY(-1px); box-shadow: var(--shadow) }
```
- **Only add `.interactive` to genuinely clickable cards** (e.g., KPI stats, product cards).
- `prefers-reduced-motion` neutralizes all transitions and hover lift.

### Buttons
| Variant | Height | Radius | Use |
|---------|--------|--------|-----|
| `.primary` | 40px | 10px | Primary CTA (Add Product, Save, etc.) |
| `.iconButton` | 38px | 10px | Icon-only (theme, notifications) |
| `.collapse` | 38px | 9px | Sidebar collapse control |
| `.dateControls button` | 40px | 10px | Date/period selectors |
| `.suggestions button` | auto | 14px | AI suggestion chips |

### Form controls
- **Search input**: 38px height, 11px radius, `var(--surface2)` bg, `var(--border)` border.
- **Selects/Inputs**: 42px height, 10px radius, `var(--surface2)` bg, focus → `var(--primary)` border.
- **Modal inputs**: 42px height, 10px radius.

### Sidebar navigation (`.navItem`)
- 40px height, 10px radius, 12px icon gap, 12px side padding.
- Hover: `var(--surface2)` bg, `var(--text)` color.
- Active: `var(--primary-soft)` bg, `var(--primary)` color, 3px left accent bar.
- Collapsed: centered icon only (span/label/em hidden via `display:none`).

### Tables
- `th`: 0.72rem, 800 weight, muted color, .03em tracking, 10px 12px padding.
- `td`: 0.85rem, 400 weight, 12px padding, hover row → `var(--surface2)`.
- Horizontal overflow on mobile via `.tableWrap { overflow:auto }`.

### Topbar
- Fixed, `left:var(--sidebar-w)`, `right:0`, 62px height.
- Glass: `color-mix(in srgb, var(--surface) 92%, transparent)` + `backdrop-filter:blur(14px)`.
- Contains: mobile menu (≤800px), page title, search (icon-only on mobile), notifications, theme toggle, profile menu.
- **No logo** — logo lives in sidebar only.

### Shell
```
.app (min-height:100vh)
├── .topbar (fixed, left=--sidebar-w)
├── .sidebar (fixed, width=--sidebar-w, z-index:40)
│   ├── .brand (mark + wordmark / mark-only)
│   ├── nav (.groupLabel + .navItem*)
│   └── .sideBottom (.storeCard + .collapse)
├── .main (margin-left=--sidebar-w, margin-right=380px when AI open, padding-top=var(--topbar))
├── .aiTrigger (fixed, right:0, top:50%, desktop only)
├── .aiFab (fixed, bottom-right, mobile only)
└── AIAssistant (fixed panel: desktop=right side, mobile=floating/fullscreen)
```

---

## 6. Sidebar brand integration

- **Expanded**: `<img src={theme==='dark'?'/assets/logo-dark.png':'/assets/logo-light.png'} className="wordmark" />` — 34px height, flex row with 10px gap to mark (mark embedded in PNG).
- **Collapsed**: `<img src={theme==='dark'?'/assets/mark-dark.png':'/assets/mark-light.png'} className="mark" />` — 34px height, centered; wordmark `display:none`.
- **Alignment**: mark + wordmark share 34px height cap → visual centers align.
- **Theme swap**: React conditional `src` (no CSS filters, no inversion).
- **Mark crops**: Generated by `scripts/crop-mark.mjs` from the canonical logos — pure pixel crops of the icon region (no recreation).

---

## 7. Theme rules

1. **Never recolour brand assets with CSS filters.** The sidebar swaps theme-aware PNGs via React conditional rendering (`theme==='dark'?logoDark:logoLight` / `markDark:markLight`).
2. Theme is `data-theme="light|dark"` on `<html>`, managed in `App.jsx`, persisted to `localStorage['storepilot-theme']`.
3. Inline script in `index.html` applies saved theme before first paint (no flash).
4. Light/dark token swap in `global.css` (`:root` / `html[data-theme=dark]`).
5. `--primary` = green (light) / purple (dark) — intentional.

---

## 8. Responsive behaviour

| Breakpoint | Sidebar | Dashboard grid | KPI stats | Tables | AI Assistant |
|------------|---------|----------------|-----------|--------|--------------|
| ≥1200px | Expanded (240px) | 1.6fr / 1fr | Fluid (5-col) | Full width | Edge tab trigger → integrated 380px panel (dashboard reflows) |
| 1024–1199px | Expanded | 1.5fr / 1fr | Fluid (4-col) | Full width | Edge tab trigger → integrated 340px panel (dashboard reflows) |
| 769–1023px | Expanded | 1.5fr / 1fr | Fluid (3-col) | Full width | Edge tab trigger → overlay panel (no reflow) |
| ≤768px | Drawer (off-canvas) | 1fr (single column) | Fluid (2-col) | Scrollable | Mobile FAB → floating agent → fullscreen |
| ≤420px | Drawer | 1fr | Fluid (1-col) | Scrollable | Mobile FAB → floating agent → fullscreen |

- No horizontal overflow at any breakpoint.
- AI Assistant is a contextual panel, NOT a dashboard section or page.
- Desktop: Edge tab trigger is always visible, slides with the panel's left edge (`right: var(--ai-w)`), and toggles icon (✦ to X) to serve as a unified open/close control.
- Mobile: FAB hidden when agent is open; floating agent positioned bottom-right; fullscreen locks body scroll.

---

## 9. Accessibility

- All interactive elements keyboard-focusable (visible focus rings).
- SVGs: `role="img" aria-label="StorePilot"` standalone; `aria-hidden="true"` decorative.
- Topbar buttons: `aria-label` on icon-only buttons.
- Sidebar nav: `NavLink` with `isActive` for ARIA current.
- `prefers-reduced-motion`: transitions disabled, hover lift removed.
- Table rows: not interactive (data only) — no tabindex needed.
- Overlay invariant: max one overlay (drawer/modal) at a time.

---

## 10. Conventions summary

| Area | Rule |
|------|------|
| Colours | Only `var(--*)` tokens; never raw hex |
| Spacing | Only `--space-page`, `--gap`, `--sidebar*`, `--topbar`, `--radius` |
| Typography | Use explicit hierarchy classes (`.eyebrow`, `.pageTitle`, etc.) |
| Cards | `.panel` base; `.interactive` only for clickable cards |
| Logo | Sidebar only; theme-aware PNG swap; collapsed = mark-only |
| Theme | No CSS filters on brand art; conditional src only |
| Responsive | Intentional breakpoints; no `width:100%` everywhere |
| Animations | CSS transitions (not Framer Motion for layout); respects reduced-motion |

---

## 10. Search & Navigation UI Conventions

### Global Search Dropdown
- **Layout Constraints**: Search results should be grouped by entity (Products, Sales, Purchases, Suppliers, Customers) with clean, uppercase dividers.
- **Mobile Responsive Behavior**: For viewports <= 600px, search results MUST render as a fixed viewport overlay with safe margins, preventing horizontal page overflow.
- **Keyboard Navigation**:
  - `ArrowDown`/`ArrowUp` keypresses cycle through options.
  - Hovering updates the active highlighted element.
  - `Enter` keypress navigates to the highlighted option.
  - `Escape` or clicking outside closes the search popover immediately.
- **Accessibility**: Include correct `role="listbox"`, `aria-autocomplete`, `aria-expanded` and `aria-selected` attributes.

### Shared Nav Indicator Animation
- **Visual Mechanics**: A single active element indicator (`.navIndicator`) slides vertically inside `<nav>` using CSS `transform: translateY()`.
- **Z-Index Controls**: The indicator operates at `z-index: 0` while NavLinks sit at `z-index: 1` so that interactive buttons always hover on top.
- **Timing**: Subtle, fast sliding transition (220ms ease/spring cubic-bezier) is applied. On `prefers-reduced-motion: reduce`, transition is instantly disabled.

---

## 11. Toast Notifications & Loading Conventions

### Custom Toast Alerts
- **Visuals**: Sat in bottom-right corner (`fixed bottom: 24px right: 24px`), theme-aware background, colored border accent corresponding to notification type (primary green for success, red for danger, amber for warning, blue for info).
- **Interactions**: Non-blocking popups that auto-dismiss after 3500ms or allow immediate manual close on `X` click. Responsive sizing wraps to full-screen width at <= 600px.

### Shimmer Skeletons
- **Markup Match**: Loading states should resemble real layouts (KPI panels, chart cards, row entries) to avoid sudden cumulative layout shifts.
- **Performance**: Shimmer animations use hardware-accelerated CSS `background-position` transitions running at 1.5s intervals.

### Modal Backdrop Override rules
- Backdrops on simple alerts or search dropdowns close on outside click.
- Backdrops on form dialogs (Products, Sales POS, Purchases procurement, Suppliers) MUST disable outside click closing to protect user inputs.

---

## 12. Landing Page Layout & Animation Conventions

### Dark-Cyan Color Palette & Height Limits
- **Background**: Near black (`#07090D`) with secondary dark layouts (`#0B1017`).
- **Accents**: Cyan (`#5EEAD4`), secondary blue (`#60A5FA`), and AI purple indicators (`#A78BFA`).
- **Typography text**: Primary text (`#F4F7F6`) and muted copy (`#89939F`).
- **Desktop Height**: Enforce exactly `100vh` on desktop viewports. All components scale so there is no scroll bar on standard screens.

### Interactive Actions
- **Hover Highlights**: Mouse hovers on the bottom feature strip elements set active outline borders (`#5EEAD4`) on target elements.
- **Watch it Work Demo**: Triggers a 3-5 seconds workflow loop showing inventory decreases, checkout alerts, revenue increments, and AI notifications.
- **Background Pulses**: Concentric radial circles (opacity: `0.35`) animate glowing dots along line paths behind the centerpiece mockup window.

---

## 13. File reference

| Purpose | File |
|---------|------|
| Design tokens + typography + page shell + cards | `frontend/src/styles/global.css` |
| Shell layout (sidebar, topbar, main, AI trigger/FAB) | `frontend/src/styles/shell.module.css` |
| Page components (dashboard, products, generic) | `frontend/src/styles/pages.css` |
| AI Assistant styles (desktop panel, mobile floating, fullscreen) | `frontend/src/styles/ai-assistant.module.css` |
| Shell component (logo swap, AI state, viewport detection) | `frontend/src/layouts/Shell.jsx` |
| AI Assistant component (all 3 modes) | `frontend/src/components/AIAssistant.jsx` |
| Dashboard page | `frontend/src/pages/Dashboard.jsx` |
| Products page (CRUD) | `frontend/src/pages/Products.jsx` |
| Seed data | `frontend/src/data/mock.js` |
| Logo assets | `frontend/public/assets/logo-light.png`, `logo-dark.png`, `mark-light.png`, `mark-dark.png` |
| Mark crop script | `scripts/crop-mark.mjs` |
| Backend entrypoint | `backend/app/main.py` |
| Backend configurations | `backend/app/core/config.py` |
| Database session helper | `backend/app/db/session.py` |
| Health API routes | `backend/app/api/routes/health.py` |

---

## 12. Backend integration conventions

The backend foundation is structured in `backend/` using FastAPI and PostgreSQL. To keep frontend-backend communication clean:
- **CORS Configuration**: Allowed origins are dynamically configured from environment variables (`CORS_ORIGINS`).
- **Error Responses**: Backend errors must use the standard error JSON response format:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable error description"
    }
  }
  ```
- **Health Verification**: Use `/health` for basic uptime checks, and `/health/db` for database connectivity health verification.
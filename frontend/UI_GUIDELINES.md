# StorePilot UI Guidelines

## Brand

The supplied StorePilot logo artwork is canonical. Use the provided image assets. Never substitute a cart, basket, P monogram, generic storefront, chart icon or icon-library logo.

## Placement

The StorePilot logo appears in the sidebar. The topbar does not contain the StorePilot logo.

## Themes

### Light
- pearl/white background
- green primary/action color
- restrained purple
- subtle borders and shadows

### Dark
- deep navy/charcoal background
- purple primary/action color
- green reserved for semantic positive states
- restrained ambient glow

## Layout

The dashboard follows the supplied reference hierarchy: greeting/filter header, five KPI cards, sales overview, top-selling products, AI recommendations, recent sales, category sales and a future-facing AI Assistant panel.

### Mobile Layout (Phase 2)
- **Viewport targets**: 375px and 390px must have **zero page-level horizontal overflow** (`document.documentElement.scrollWidth === clientWidth`).
- **Sidebar**: Drawer from left edge (280px/260px/240px by breakpoint), backdrop, no layout shift.
- **Topbar**: Search input collapses to icon-only at ≤390px; all controls fit viewport without overflow.
- **Dashboard**: Single column; KPI stats 2-col (→1-col at ≤420px); chart heights reduced (240→200→180→160→150px); tables scroll internally only.
- **Spacing**: Page padding reduced (40→32→18→16→14px); gap reduced (18→14→12→10px).

## AI Assistant UX (Phase 2)

### Desktop (≥769px)
- **Reveal**: Fixed right-edge pill button (vertical center), animated hover slide, purple accent.
- **Drawer**: Right-side panel (400px), full height, backdrop blur, slide-in animation.
- **Content**: Bot greeting, suggestion chips (5), input + send, all keyboard accessible.
- **Focus**: Trap on open, restore on close, Escape closes, backdrop click closes.

### Mobile/Tablet (≤768px)
- **FAB**: Bottom-right floating button (52px→48px→44px), gradient primary→purple, pulse-ready.
- **Drawer**: Same component as desktop (reused), full height/width on mobile.
- **No reveal button**: Hidden via media query.

### Accessibility (both)
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label="AI Assistant"`
- Focus management: auto-focus drawer, trap tab cycle, restore trigger on close
- Keyboard: Escape to close, Tab cycles within drawer
- Reduced-motion: Animations disabled, instant transitions

## Interaction

Motion should be subtle and respect reduced-motion preferences. Components should remain keyboard accessible and responsive.

## Backend integration reference

Backend APIs are implemented separately in `backend/` using FastAPI and SQLAlchemy. Frontend integrations will call endpoints exposed under this environment in future milestones. CORS headers are configured on the backend using settings.

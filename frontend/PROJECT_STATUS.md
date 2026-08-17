# StorePilot Status

## Complete (Milestones 1–4 + Phase 2 Mobile + AI)

- React/Vite frontend shell with theme system (light/dark, persisted, no-flash)
- Responsive sidebar and topbar with single-source-of-truth `--sidebar-w`
- Dashboard with KPI stats, sales chart, top products, AI recommendations, recent sales table, category pie, AI assistant panel
- Products page: full CRUD (table/grid, search, category/status/sort filters, add/edit/delete, details drawer, form validation)
- Inventory / Sales / Purchases / Suppliers / Reports / AI Assistant / Settings route shells (GenericPage)
- Mock charts (Recharts), KPIs, tables, AI recommendation UI
- StorePilot branding in sidebar: full lockup (expanded) / mark-only (collapsed); theme-aware PNG swap
- **UI Foundation Polish (Milestone 4):**
  - Typography overhaul (hierarchy, rhythm, weights)
  - Dashboard uses full horizontal space
  - Logo alignment & collapsed mark-only
  - Collapsed sidebar gap eliminated
  - Premium card hover interactions
  - Full responsive behavior (1440→375px)
  - Topbar logo removed, tracks sidebar
- **Mobile Layout + AI Assistant UX (Phase 2):**
  - Zero horizontal overflow at 375px/390px (verified)
  - Mobile sidebar drawer with backdrop, proper widths (280/260/240px)
  - Mobile topbar: search collapses to icon at ≤390px
  - Mobile dashboard: single column, scaled charts (150px at 375px), internal table scroll
  - AI Assistant desktop: right-edge reveal button → right drawer (400px) with backdrop, focus trap, Escape/backdrop-close
  - AI Assistant mobile: FAB bottom-right → full-height drawer (reused component)
  - Accessibility: ARIA roles, focus management, keyboard nav, reduced-motion respected
  - Animation: CSS transitions, prefers-reduced-motion instant

## Backend Roadmap (New)

- **Backend Foundation Setup (Completed)**: FastAPI backend, database configuration, Alembic migration structure, basic health checks, pytest configuration.
- **Products Database & API (Next)**: Implement actual Products database tables and API routes.

## Intentionally deferred

- Authentication
- Real analytics
- AI APIs and AI logic
- Production data fetching (react integration)
- Inventory / Sales / Reports business logic
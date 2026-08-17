# StorePilot — Changelog

## StorePilot — Creative Login Page Redesign & Auth Navigation Fix 🎨

**Date:** 2026-08-16

Redesigned the login page into a premium two-sided split layout aligned with the StorePilot visual identity, and resolved the missing navigation link to the public landing page.

Key Refinements:
- **Two-Column Split Layout**: Added a visual storytelling panel on the left (visible on desktop/tablet) and a compact, glassmorphism login form card on the right.
- **Left Panel Visuals**: Added a large typography header ("SEE YOUR STORE CLEARLY."), a live-animated sales SVG chart using path dash-array animations, and floating micro-cards ("Inventory healthy", "3 AI insights ready") using subtle translation keyframes.
- **Home Navigation Fix**: Added a clearly visible "← Back to StorePilot" explicit navigation link linking to the root path (`/`).
- **Dynamic Assets**: Enabled the page to dynamically toggle its brand logo paths (`logo-light.png` or `logo-dark.png`) to adapt immediately based on the selected light/dark theme state.
- **Verification**: Verified production compilation chunk outputs success with zero warnings.

---

## StorePilot — Select Option Contrast Fix (Dark Mode) 🛠️

**Date:** 2026-08-16

Resolved the accessibility and contrast bug where native dropdown options inside select elements were unreadable (white/light options text on a white/light dropdown background) in Dark Mode.

Key Refinements:
- **Solid Option Backgrounds**: Explicitly styled `select option` to use solid background `var(--surface)` (#0B1017 in dark mode, #FFFFFF in light mode) and color `var(--text)`. This overrides inherited translucent background properties and ensures correct native contrast rendering.
- **Color Scheme Inheritance**: Set `color-scheme: inherit` on all `select` elements to force the browser's native renderer to respect the active dark/light mode context.
- **Verification**: Verified production compiler chunks (`npm run build`) succeed with zero warnings.

---

## StorePilot — Modal / Dialog Rendering Fix (React Portals) 🛠️

**Date:** 2026-08-16

Successfully migrated operational modal dialogs to React Portals, rendering them directly under `document.body` to resolve Chromium layout engine containing block translation issues.

Key Refinements:
- **React Portals Migration**: Wrapped dialog overlays inside `createPortal(..., document.body)` in `Inventory.jsx`, `Products.jsx`, `Sales.jsx`, `Purchases.jsx`, and `Suppliers.jsx`.
- **Compositor Isolation**: Escaped the route transition (`.pageTransition`) transform constraints, bypassing the Chromium compositor `backdrop-filter` rendering bug where nested fixed children become invisible.
- **Visual Integrity**: Left existing brand color schemas, margins, borders, modal sizes, and responsive overrides completely untouched.
- **Verification**: Vite production chunks and backend unit tests compile and run with zero errors.

---

## StorePilot — Modal / Dialog Rendering Bug Fix 🛠️

**Date:** 2026-08-16

Resolved the functional bug where modal dialogs/modals (Adjust Stock, Add Product, Create Sale, Add Purchase, Add Supplier, etc.) failed to render on screen.

Key Refinements:
- **Compositor Stacking Solution**: Resolved the Chromium rendering bug where transitioning `opacity` on a container with `backdrop-filter: blur(...)` hides all child elements.
- **Dynamic Background Animations**: Replaced parent backdrop opacity transitions with `@keyframes fadeInBackdrop` transitioning `background-color` instead. This preserves backdrop blurs while guaranteeing nested dialogs remain visible.
- **Theme-Aware Backdrops**: Added `--modal-backdrop` to style dark backdrops (`rgba(5, 7, 13, 0.85)`) and light backdrops (`rgba(15, 23, 42, 0.35)`) cleanly.
- **Verification**: Verified production compiler chunks (`npm run build`) and backend tests (`pytest`) run with zero errors.

---

## StorePilot — Light Mode Repair & Theme Consistency Pass ☀️

**Date:** 2026-08-16

Successfully repaired and completed Light Mode across the entire authenticated application while leaving the Dark Mode frozen exactly as-is.

Key Refinements:
- **Sophisticated Light Palette**: Set up `--bg` (`#F5F8FA`), `--surface` (`#FFFFFF`), `--surface2` (`#EEF3F5`), `--text` (`#0B1220`), `--muted` (`#718096`), `--border` (`#D9E2E8`), `--primary` (`#0F9F8C` StorePilot Teal), and `--purple` (`#7C3AED`).
- **Topbar & Sidebar Theme Mappings**: Added theme-aware variables for topbars (`--topbar-bg`) and sidebars to dynamically adapt surfaces without hardcoded overrides. Swapped profile avatars text colors dynamically using `var(--bg)` contrast colors.
- **Contrast-Perfect Badges & Recommendations**: Mapped table badges and recommended metrics using dark accessible text colors (`#dc2626` for danger, `#0f9f8c` for success, `#d97706` for warning, `#2563eb` for info) and light backgrounds.
- **Theme-Independent Chat Bubbles**: Utilized `color-mix` inside `AIAssistant.jsx` to dynamically tint assistant bubbles in both light and dark modes via `var(--purple)`.
- **Validation**: Compiled both themes successfully with zero warnings, and pytest returns all passing logs.

---

## StorePilot — Unified Landing + Dashboard Design System Migration 🎨

**Date:** 2026-08-16

Successfully migrated the entire authenticated application to adopt the landing page's dark-cyan visual language, ensuring a unified aesthetic from landing → login → dashboard → operational pages → reports → settings → AI assistant.

Key Refinements:
- **Centralized Design Tokens**: Defined theme variables in `global.css` for primary/secondary backgrounds (`#07090D`, `#0B1017`), primary accent (`#5EEAD4`), and AI purple (`#A78BFA`).
- **Sidebar & Topbar Redesign**: Updated sidebars and topbars in `shell.module.css` to render elevated translucent dark containers matching the landing page preview. Swapped logo assets to resolve invisibility in dark mode.
- **Card & Form Standardizations**: Standardized inputs, buttons (`.primary`), and dashboard KPI stats cards (`.stat`) using CSS tokens.
- **AI Purple Theme Integration**: Styled the AI Assistant conversation bubbles, panels, trigger tags, and insights cards with a purple identity to differentiate operational vs intelligent states.
- **Vite & Pytest Validations**: Verified production bundle compiles successfully and backend unit tests pass.

---

## Final Public Landing Page Implementation 🚀

**Date:** 2026-08-16

Finalized the landing page structure to match the visual targets of the approved reference image:
- **100vh Layout Constraint**: Managed layouts to fit exactly inside a single desktop screen height (`100vh`) with flex containers, preventing vertical scrolls on standard desktop sizes.
- **Pill Navbar Re-design**: Restructured the header as a pill-shaped card with top breathing margins (`18px-24px`), height `64px`, border-radius `16px`, and background blur. Removed center links to show only *About*, *Sign In*, and *Open StorePilot →*.
- **AI Orb overlaps**: Pinning orb position to dashboard right column layout bounds to ensure overlaps remain locked on viewport resize.
- **Removed Obsolete footers**: Removed scrolling footer blocks from the main landing page viewport flow to maintain a clean layout.
- **Data field grids**: Concentric orbits render low-opacity animations (`0.35`) and cyan data pulses trailing across paths.

---

## Public Landing Page Rebuild (Single Viewport) ✅

**Date:** 2026-08-16

Rebuilt the public landing page into a clean, premium, single-viewport experience centered around the actual StorePilot product UI:
- **Floating Navbar**: Minimal design with Product/AI dropdowns, scrolling links, Sign In routing, and an About modal trigger.
- **Hero Left side**: Editorial style layout with clear CTA hierarchy ("Open StorePilot" and "Watch it work").
- **3D Parallax Dashboard Preview**: Centerpiece app mockup featuring rounded corners, dark glass surface, cyan edge glow, and cursor-tracking tilt.
- **Interactive Highlight triggers**: Hovering the bottom feature items (Inventory, Sales, Reports, AI Insights) adds a cyan highlight outline to corresponding dashboard sections.
- **Watch it Work Simulation**: Clicking "Watch it work" triggers a 3-5 seconds interactive demo cycling through inventory updates, POS sale checkout, revenue increments, and AI warning indicators.
- **Concentric Grid Background**: SVG grid lines with data pulses trailing periodically.
- **About Modal**: Compact glass description overlay.
- **Compact Footer**: Unified directory links and the trust line: "Built for store owners who want to run their business smarter."

---

## Public Landing Page Launch ✅

**Date:** 2026-08-16

Added a premium, highly responsive, interactive public landing page for StorePilot at `/` while maintaining the existing authenticated application.
- **Hero Grid**: Staggered animated editor copy, primary/secondary action triggers, check benefit badges, and interactive dashboard preview.
- **Interactive Dashboard Preview**: Realistic dark preview featuring staggered KPI counters, auto-drawing SVG sales line charts, top product lists, and hover-triggered pointer 3D parallax angles.
- **AI assistant orb**: Custom floating floating orb bubble that reacts to hover and clicks with simulated insight dialog cards.
- **Everything connects section**: Interactive central node linked with SVG connector paths that dynamically illuminate when elements are hovered.
- **AI Conversation Box**: Inline message bubble prompt layout featuring typing indicators, list updates, and percentage comparison lines.
- **Intelligence visuals**: Auto-rendering vector SVG charts displaying growth trends and rotation indicators.
- **Landing page layout & footer**: Clean, responsive modular structure with collapsing mobile navbar drawer and full footer column links.

---

## Global UX, Responsiveness & Micro-Interaction Polish Pass (Phase 1 to 21) ✅

**Date:** 2026-08-16

Successfully completed a global frontend UX polish pass across all modules of the StorePilot application:
- **Toast Notifications System**: Created an custom, lightweight, non-blocking Toast provider (`ToastContext.jsx`) rendering notifications for actions (creating, updating, deleting catalog entities, adjusting stock, recording sales/purchases, P&L reporting downloads, and authentication).
- **Responsive Shimmer Skeletons**: Designed elegant CSS shimmer skeleton loaders matching real layouts for dashboards, products, inventory tables, and reports to replace text strings.
- **Accidental Closure Safeguards**: Disabled outside-backdrop clicks on critical form dialogs (Products, Inventory Adjustments, Sales, Purchases, Suppliers) to prevent data loss. Added dedicated 'Cancel' buttons and top-right close 'X' buttons.
- **Route transitions**: Implemented key-based unmount/remount transitions (`fadeInTranslate` 180ms bezier) on page changes inside `Shell.jsx`, respecting `prefers-reduced-motion` settings natively.
- **Form Focus & Outline States**: Added `:focus-visible` outline rings for buttons, link menus, and selects, and standardized input field transitions.
- **Standardized Empty States**: Designed clean empty cards featuring context-appropriate CTAs across Products, Sales, Purchases, Notifications, and Reports.

---

## Global Search & Sidebar Navigation Animation (Issues 12 & 13) ✅

**Date:** 2026-08-15

Implemented a consolidated global search system and polished navigation transitions in the sidebar:
- **FastAPI Global Search**: Added a `/api/search` endpoint scoping search results to authenticated users. Fetches Products (active only), Sales, Purchases, Suppliers, and Customers with DB-level `ilike` and index filters, limited to 5 results per entity type.
- **Accessible Frontend Popover**: Added debounced search popover (250ms) in the topbar with ARIA accessibility tags, keyboard navigations (Arrow Up/Down, Enter, Escape), outside-click dismissals, and responsive overlay mapping for viewports <= 600px.
- **Shared Sidebar Indicator**: Designed a single DOM-based active indicator (`.navIndicator`) that translates vertically between nav links upon URL/pathname changes.
- **Responsive Animations**: Added subtle, fast 220ms sliding transitions, native dark (purple) and light (green) theme integration, and disabled transition timing under `prefers-reduced-motion`.

---

## Consolidated Functional & UX Fix Pass (Issues 1 to 11) ✅

**Date:** 2026-08-15

Resolved 11 functional, data-integrity, performance, and UX issues discovered during browser testing:
- **Soft Deletion / Product Archival**: Introduced `is_active` column on Products via Alembic database migration (`afc23e883149_add_product_is_active.py`). Configured services to soft-delete (archive) products with transaction history while hard-deleting others.
- **Inventory Overview Tab**: Populated the "All Products" (overview) tab in the Inventory page with active database products, calculated stock values, and status badges.
- **Dashboard Query Optimization**: Eliminated N+1 query bottlenecks in profit calculations and daily loop queries in `dashboard_service.py`, decreasing page load db calls from 62 to 1.
- **Dashboard Date Filters Smoothness**: Refactored `Dashboard.jsx` loading states to keep layout visible while updating ranges. Added a localized opacity mask and an error-retry banner on API failure.
- **Topbar Notifications Popover**: Replaced Settings redirection with a Bell dropdown popover featuring unread badges, outside-click close, Escape key support, and mark as read options.
- **Modal Control Behaviors**: Standardized modal behavior across Products, Inventory, Sales, Purchases, and Suppliers to support backdrop outside-click and Escape key down dismissals, and added Cancel button controls.
- **Reports Formatting & Inclusive Ranges**: Implemented unified currency/unit formatting helpers. Upgraded backend date filters to accept date types and filter ranges inclusively using timezone-aware start and end boundaries.
- **Sidebar & Profile Redesign**: Removed redundant profile card from sidebar bottom. Redesigned topbar avatar dropdown to include a multi-section header with user role, email, and Settings navigation links.

---

## Complete Retail Application Implementation ✅

**Date:** 2026-08-15

Completed full-stack end-to-end integration of the StorePilot retail management platform, connecting frontend React views to FastAPI REST routes, database ledgers, and Gemini AI.

### Database Domain & Migrations
- **Schema Mapping**: Developed 12 SQLAlchemy database models mapping entities (User, Store, Product, Category, Supplier, Customer, Purchase, PurchaseItem, Sale, SaleItem, InventoryTransaction, Notification) with relational mappings and foreign key configurations.
- **Auto-Calculations**: Created hybrid attributes computing stock statuses dynamically rather than saving derived fields.
- **Alembic Migrations**: Generated migration history scripts creating the complete schema in the target PostgreSQL instance.

### Authentication & Authorization
- **FastAPI Auth**: Created login and current user endpoints validating JWT access tokens. Incorporated password security using bcrypt.
- **React Auth State**: Built React context hooks storing user states, persists tokens, and wraps all secure routes in protected wrappers redirecting unauthenticated traffic to the login view.
- **Admin Seeding**: Seeded standard administrator login credentials safely within the database setup configurations.

### Transactional Service Layers
- **Atomic Sales**: Created Sales processing services using database transaction blocks ensuring inventory stock decreases, invoice numbers increment, and transaction ledgers write atomically.
- **Atomic Purchases**: Created Purchases services registering restocks, adjusting costs, and creating inventory ledger entries.
- **Ledger Controls**: Channeled all inventory mutations through a central service layer generating stock alerts and preventing inventory divergence.

### Real Analytics & Reporting
- **Live Widgets**: Programmed queries aggregating total revenue, profit margins, active orders, total stock value, and health scores dynamically.
- **Period Filters**: Added date filter scopes (today, last 7 days, last 30 days, this/last month) updating line-charts and tables instantly.
- **Tabular Business Reports**: Created 5 report panels (Sales, Products, Inventory, Purchases, Profit) supporting date range filtering, summaries, and CSV data downloads.

### Notification System
- **Threshold Alerts**: Automatic background warnings when product stock levels fall below reorder values.
- **Unread Indicators**: Auto-polling endpoints counting unread notifications and badge updates on top navigation controls.

### AI Engine & Recommendations
- **Gemini Interfacing**: Constructed an abstract provider pattern querying Gemini models with structured query context derived directly from DB values.
- **Context Boundaries**: Passed statistical facts to AI rather than allowing models to calculate financials.
- **Offline Safeguard**: Programmed API switches ensuring the application operates normally even if Gemini API keys are omitted, redirecting AI assistant states gracefully.

### Demo Seeding & Testing
- **Indian Retail Seed**: Developed an idempotent command loading Indian retail brands (Amul, Tata, Maggi, Parle-G, Fortune), categories, suppliers, customers, and 60 days of realistic sales/purchases history.
- **Robust Verification**: Structured a testing suite containing 15 automated test cases validating auth, products catalog, transactional safety, database rollbacks, and dashboard metrics on memory-isolated SQLite.

---

## Backend Milestone 1 — Backend Foundation Setup ✅

**Date:** 2026-08-14

Established a clean, production-oriented backend foundation separate from the frontend.

### Backend Infrastructure
- **FastAPI Application**: Created main application with lifespan handling, CORS configuration, router registration, and unified unhandled error formatter.
- **Settings & Config**: Configured `pydantic-settings` to load configuration settings (`DATABASE_URL`, `APP_ENV`, `DEBUG`, `CORS_ORIGINS`) dynamically from environment files.
- **SQLAlchemy 2.x**: Configured engine, session factory, and declarative Base. Added 3-second database connection timeout to prevent application hanging when PostgreSQL is offline.
- **Alembic Migrations**: Setup Alembic migrations. Configured dynamic URL loading from settings in `alembic/env.py`.
- **Health Checks**: Implemented lightweight `GET /health` (independent of database) and database-connected `GET /health/db` (returning 503 if unreachable).
- **Testing**: Added pytest suite with httpx client testing endpoints, with clean skip logic for direct database connectivity tests.
- **Documentation**: Created `backend/README.md` with setup, commands, PostgreSQL directions, and API parameters.

---

## Milestone 5 — AI Assistant UX Rework ✅

**Date:** 2026-08-14

Replaced the multi-entry-point AI Assistant and polished the dashboard layout for a premium, aligned analytics workspace.

### Dashboard Grid Composition
- **Editorial Layout**: Reordered cards in Dashboard.jsx.
- **Fluid KPI Cards**: Updated `.stats` grid columns to use fluid auto-fit.
- **Card Height Alignment**: Allowed stretch behavior for card height alignment.
- **Pie Chart Wrapping**: Handled legend wrapping for pie chart.

### Desktop AI Workspace & Transitions
- **Workspace Container**: Implemented side-by-side flex layout.
- **Dynamic Reflow**: Made main content reflow dynamically.
- **Width Animation**: Added width and opacity transitions.
- **Tablet Overlay Mode**: Swapped to overlay on tablet viewports.

### Edge-Mounted Control Redesign
- **Reveal Tab**: Trigger button attached directly to right edge chrome.
- **Stateful Control**: slides alongside AI drawer, Escape key to close.
- **Accessibility**: focus rings, keyboard support, mobile safety.

---

## Milestone 4 — UI Polish, Milestone 3 — Brand Identity, Milestone 2 — Products, Milestone 1 — Project Foundation
*(See previous changelog entries for full details)*

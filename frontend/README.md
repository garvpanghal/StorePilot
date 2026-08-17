# StorePilot — Frontend Application

StorePilot frontend application built using React 19 + Vite, Recharts, and Lucide React. It connects to the FastAPI backend API to manage store operations and render real-time statistics, inventory control parameters, and AI-driven business insights.

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5173`. The configured Vite proxy redirects all requests to `/api` and `/health` to the FastAPI backend server on `http://localhost:8000` automatically.*

3. **Build for production**:
   ```bash
   npm run build
   ```
   *Generates minified distribution files under `dist/`.*

---

## 📂 Project Structure

- `src/api/api.js` — Core HTTP API client wrapping all FastAPI routes. Handles automated Bearer JWT authorization and redirection to login on unauthenticated (401) states.
- `src/context/AuthContext.jsx` — React Context tracking login session states and persisting tokens in localStorage.
- `src/context/ToastContext.jsx` — [NEW] Toast Notification Context Provider exposing showToast notifications.
- `src/components/ProtectedRoute.jsx` — Guard wrapper redirecting unauthenticated users to `/login`.
- `src/components/landing/` — Contains all modules for the landing page:
  - `LandingNavbar.jsx` — Minimal floating pill header with About modal trigger.
  - `HeroContent.jsx` & `DashboardPreview.jsx` — Editorial copy columns and interactive centerpiece dashboard mockup.
  - `AIInsight.jsx` — Floating AI notification bubble.
  - `FeatureStrip.jsx` — Bottom horizontal feature strip.
  - `AboutModal.jsx` — About overlay popup.
- `src/layouts/Shell.jsx` — Application shell sidebar, topbar notifications badge, page transition wrappers, and collapsible parameters.
- `src/pages/` — Connected sub-pages:
  - `LandingPage.jsx` — Public landing page container mapping single-viewport layout.
  - `Login.jsx` — Form with credentials validation and error logs.
  - `Dashboard.jsx` — Real stats widgets, LineChart, PieChart, Top Products rank, and recent invoices. Has shimmer skeleton support.
  - `Products.jsx` — CRUD actions, search, category and status filtering, table/grid switches, add/edit forms, skeletons, and CTA empty states.
  - `Inventory.jsx` — Ledger overview metrics, low stock indicators, manual transaction adjustment forms, skeletons, and empty states.
  - `Sales.jsx` / `Purchases.jsx` — Transaction forms with multi-item entries, auto price updates, and quantity checks. Skeletons and empty states.
  - `Suppliers.jsx` — Vendor cards with contact details, updates, skeletons, and empty states.
  - `Reports.jsx` — Generates Sales, Products, Inventory, Purchases, and Profit tables with date range filtrations, CSV exports, skeletons, and empty states.
  - `Settings.jsx` — Store profile and user preferences.
- `src/styles/` — Core design tokens and page alignments:
  - `global.css` — Tokens, theme variables, typography, scroll behaviors, loading spinner, skeletons shimmer, and toast notification layouts.
  - `pages.css` — Layout elements for dashboards, lists, forms, and skeleton components.
  - `shell.module.css` — Sidebar, header, and page fade-in transitions.
  - `ai-assistant.module.css` — Desktop panel, mobile FAB, and fullscreen drawer layouts.

---

## 🎨 Design System & Visuals

- **Accent colors**: Green accent on Light Theme, Purple accent on Dark Theme.
- **Sidebar Indicator**: Shared single DOM-positioned `.navIndicator` sliding smoothly vertically using CSS transitions between active links.
- **Global Search**: Topbar search debounces input by 250ms, provides accessible keyboard navigations (Arrow Up/Down, Enter, Escape) and option options mapping, and falls back to viewport-fixed popovers on screen widths <= 600px to prevent overflow.
- **Responsive chromium**: Edge-reveal AI assistant tab on desktop, floating FAB bubble on mobile, viewport-clamped layout safe for 390px and 375px screens with zero horizontal overflow.
- **Theme control**: Swaps `data-theme="light|dark"` attribute on `<html>`. Persisted locally. No style flash on initial pageload.
# StorePilot

Premium retail management platform for grocery stores and retail businesses.

## Overview

StorePilot is a modern, theme-aware (light/dark) full-stack web application built for day-to-day retail operations: product catalog management, inventory tracking, sales processing, procurement, and business analytics.

The application connects a responsive React 19 + Vite frontend to a robust, container-ready FastAPI backend using SQLAlchemy ORM to persist data in a PostgreSQL database. An abstract AI provider layer connects to Gemini to deliver business health metrics, executive summaries, chart explanations, and intelligent natural-language recommendations.

## Modules (All Connected & Real)

| Module | Status | Description |
|--------|--------|-------------|
| App Shell | ✅ Complete | Theme system, routing, responsive sidebar and topbar |
| Authentication | ✅ Complete | Password hashing, logins, JWT bearer token verification, protected routes |
| Products | ✅ Complete | Full CRUD — list, search, category/status filter, sort, table/grid, modals |
| Inventory | ✅ Complete | Stock level controls, manual adjustments, history logging, automatic status computation |
| Suppliers | ✅ Complete | Supplier CRUD, relationship tracking, product catalogue |
| Purchases | ✅ Complete | Procurement purchase orders, supplier association, multi-item entries, auto stock-in updates |
| Sales | ✅ Complete | POS transaction log, walk-in customer creation, payment method, stock check validations, auto stock-out updates |
| Dashboard | ✅ Complete | Real KPI metrics (revenue, profit, orders, inventory valuation/health), charts, recent sales |
| Reports | ✅ Complete | Detailed Sales, Products, Inventory, Purchases, Profit reports with date filter & CSV export |
| Notifications | ✅ Complete | Critical/low stock alerts, purchase completion logs, unread indicators, polling refresh |
| AI Engine | ✅ Complete | Dynamic chat assistant, executive summary, health scores, recommendations based on actual DB statistics, graceful offline handling |

## Tech stack

### Frontend
- React 19 · Vite · React Router · Recharts · Lucide Icons
- CSS Modules + CSS custom properties (design tokens in `global.css`)
- Custom lightweight Toast & Loading components (zero styling dependencies)

### Backend
- Python 3.13 · FastAPI · Uvicorn
- SQLAlchemy 2.x ORM · Alembic database migrations
- Pydantic v2 validation & configuration
- pytest unit tests (isolated SQLite database in-memory)
- PostgreSQL 18 database

## Project root

The repository root is `d:\Project\StorePilot`.
- Frontend application lives in `frontend/`.
- Backend application lives in `backend/`.

## Documentation

- `PROJECT.md` — this file (project overview)
- `PROJECT_STATUS.md` — current milestone status
- `CHANGELOG.md` — what changed per milestone
- `CLAUDE_CONTEXT.md` — context for AI assistants working on this codebase
- `UI_GUIDELINES.md` — brand rules, colour system, component patterns
- `frontend/README.md` — frontend-specific technical documentation
- `backend/README.md` — backend-specific setup and configuration documentation
# StorePilot

> A modern full-stack retail management platform for managing products, inventory, sales, purchases, suppliers, customers, reports, notifications, and AI-powered business insights.

StorePilot is a full-stack web application designed for grocery stores and retail businesses. It brings day-to-day store operations into a single dashboard, combining transactional management, inventory control, analytics, reporting, and Gemini-powered AI assistance.

The application uses a **React + Vite frontend**, a **FastAPI backend**, **PostgreSQL** for persistent data, and an AI provider layer connected to **Google Gemini**.

---

## ✨ Features

### 🔐 Authentication & Security

* JWT-based authentication
* Secure password hashing with bcrypt
* Protected application routes
* Current-user authentication and authorization
* Role-aware application structure
* Persistent frontend authentication state

### 📦 Product Management

* Create, update, and delete products
* Product search
* Category filtering
* Active/inactive product filtering
* Product sorting
* Table and grid views
* Product details
* Product archival through soft deletion where transaction history exists
* Stock and pricing information

### 📊 Inventory Management

* Real-time inventory overview
* Current stock tracking
* Stock valuation
* Low-stock detection
* Reorder-level monitoring
* Manual stock adjustments
* Inventory transaction history
* Automatic stock updates from sales and purchases
* Inventory status calculation

### 🛒 Sales Management

* Record sales transactions
* Multi-item sales
* Stock availability validation
* Automatic stock deduction
* Invoice generation/numbering
* Payment method tracking
* Walk-in customer support
* Transaction history
* Atomic database transactions to maintain inventory consistency

### 🚚 Purchase Management

* Create purchase transactions
* Multi-item purchase entries
* Supplier association
* Automatic inventory restocking
* Purchase history
* Cost tracking
* Inventory ledger integration

### 🏢 Supplier Management

* Supplier CRUD operations
* Supplier contact information
* Supplier-product relationships
* Supplier purchase history

### 👥 Customer Management

* Customer records
* Customer information associated with transactions
* Walk-in customer support

### 📈 Dashboard & Analytics

The dashboard calculates business metrics from the actual database rather than relying on static values.

Includes:

* Revenue
* Profit
* Orders
* Inventory valuation
* Inventory health
* Recent sales
* Top products
* Sales trends
* Date-based analytics
* Business performance indicators

Supported reporting periods include options such as:

* Today
* Last 7 days
* Last 30 days
* This month
* Last month

### 📑 Business Reports

StorePilot provides dedicated reports for:

* Sales
* Products
* Inventory
* Purchases
* Profit

Reports support date filtering, summary information, and CSV exports.

### 🔔 Notifications

The notification system provides operational alerts such as:

* Low-stock warnings
* Critical inventory alerts
* Purchase completion notifications
* Unread notification counts
* Notification polling and refresh
* Mark-as-read functionality

### 🤖 AI Business Intelligence

StorePilot integrates Google Gemini through an abstract AI provider layer.

AI functionality includes:

* AI assistant/chat
* Business health insights
* Executive summaries
* Recommendations
* Context-aware business analysis
* AI-generated suggestions based on actual database statistics
* Graceful offline behavior when an AI API key is unavailable

The AI layer is designed so that business statistics are derived from the database first and then supplied as context to the AI rather than allowing the model to independently calculate core financial figures.

### 🔎 Global Search

The application includes a global search system capable of searching across:

* Products
* Sales
* Purchases
* Suppliers
* Customers

The search interface includes:

* Debounced search
* Keyboard navigation
* Arrow-key selection
* Enter-to-open behavior
* Escape-to-close behavior
* Responsive search presentation

### 🎨 Theme System

StorePilot supports:

* Light theme
* Dark theme
* Persistent theme selection
* Theme-aware branding
* Theme-aware UI tokens
* Responsive visual components

The brand uses:

* **Green** as the primary light-theme accent
* **Purple** as the primary dark-theme accent

### 📱 Responsive Design

The interface is designed for desktop, tablet, and mobile layouts.

Responsive behavior includes:

* Collapsible desktop sidebar
* Mobile navigation drawer
* Responsive dashboard grids
* Responsive tables
* Mobile AI assistant
* Mobile floating action button
* Responsive modals and forms
* No intended horizontal overflow on supported mobile breakpoints

---

## 🧠 Architecture

StorePilot follows a separated full-stack architecture:

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + Vite        │
                         │ Frontend            │
                         │                     │
                         │ Dashboard           │
                         │ Products            │
                         │ Inventory            │
                         │ Sales                │
                         │ Purchases            │
                         │ Suppliers            │
                         │ Reports              │
                         │ AI Assistant         │
                         └──────────┬──────────┘
                                    │
                              REST API / JWT
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ FastAPI Backend     │
                         │                     │
                         │ API Routes          │
                         │ Schemas             │
                         │ Services            │
                         │ Authentication      │
                         │ Business Logic      │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │ PostgreSQL      │             │ Google Gemini   │
          │                 │             │                 │
          │ Application     │             │ AI Assistant    │
          │ Data            │             │ Insights        │
          │ Transactions    │             │ Recommendations │
          └─────────────────┘             └─────────────────┘
```

### Backend architecture

The backend is organized into several layers:

```text
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── seed.py
│   └── main.py
│
├── alembic/
├── tests/
├── requirements.txt
└── .env.example
```

The backend separates:

* API routing
* Request/response validation
* Database models
* Business logic
* Authentication
* AI services
* Database access
* Migration management

### Frontend architecture

```text
frontend/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   └── styles/
│
├── package.json
├── package-lock.json
├── vite.config.js
└── index.html
```

The frontend communicates with the FastAPI backend through a centralized API client and uses protected routes for authenticated application pages.

---

## 🛠️ Technology Stack

### Frontend

| Technology            | Purpose                  |
| --------------------- | ------------------------ |
| React 18.3.1          | UI framework             |
| Vite 6                | Frontend build tool      |
| React Router 6        | Client-side routing      |
| Recharts              | Data visualization       |
| Lucide React          | Icons                    |
| CSS Modules           | Component-level styling  |
| CSS Custom Properties | Design tokens and themes |

### Backend

| Technology               | Purpose                       |
| ------------------------ | ----------------------------- |
| Python 3.13              | Backend runtime               |
| FastAPI                  | REST API framework            |
| Uvicorn                  | ASGI server                   |
| SQLAlchemy 2.x           | ORM                           |
| PostgreSQL 18            | Relational database           |
| Alembic                  | Database migrations           |
| Pydantic v2              | Data validation/configuration |
| python-jose              | JWT authentication            |
| Passlib + bcrypt         | Password hashing              |
| pytest                   | Automated testing             |
| HTTPX                    | API testing                   |
| Google Generative AI SDK | Gemini integration            |

---

## 📁 Project Structure

```text
StorePilot/
│
├── backend/
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── seed.py
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   ├── alembic.ini
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
│
├── scripts/
├── CHANGELOG.md
├── PROJECT.md
├── PROJECT_STATUS.md
├── UI_GUIDELINES.md
├── storepilot-branding-reference.png
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Python 3.13+
* Node.js
* npm
* PostgreSQL 18+
* Git

For AI functionality:

* A Google Gemini API key

---

# ⚙️ Backend Setup

### 1. Navigate to the backend

```bash
cd backend
```

### 2. Create a Python virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create your local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Configure the required values.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/storepilot
SECRET_KEY=YOUR_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

**Never commit `.env` to GitHub.**

The repository contains `.env.example` as a safe configuration template.

### 5. Create the PostgreSQL database

Create a PostgreSQL database named:

```text
storepilot
```

Then make sure `DATABASE_URL` points to it.

### 6. Run database migrations

From the `backend/` directory:

```bash
alembic upgrade head
```

### 7. Seed demo data

StorePilot includes an idempotent seed script containing realistic retail demo data.

Windows PowerShell:

```powershell
$env:PYTHONIOENCODING='utf-8'
python -m app.seed
```

The seed process creates demo users, products, categories, suppliers, customers, inventory data, sales, purchases, and historical business data.

### 8. Start the backend

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# 🎨 Frontend Setup

Open another terminal.

### 1. Navigate to the frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The Vite development configuration proxies API requests to the FastAPI backend.

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

---

## 🧪 Testing

The backend includes an automated pytest suite using an isolated in-memory SQLite database for testing.

Run:

```bash
cd backend
pytest tests/ -v
```

The project status currently records **15 automated backend tests** covering areas such as:

* Authentication
* CRUD operations
* Relationships
* Transactions
* Inventory behavior
* Dashboard metrics

---

## 📊 Core Data Model

StorePilot uses PostgreSQL with SQLAlchemy ORM.

The core domain contains entities including:

```text
User
 │
 └── Store

Product ─── Category
   │
   ├── Inventory Transactions
   ├── Sale Items
   └── Purchase Items

Supplier
   │
   └── Purchases

Customer
   │
   └── Sales

Sale
 └── Sale Items

Purchase
 └── Purchase Items

Notification
```

Database schema changes are managed through **Alembic migrations**.

---

## 🤖 AI Architecture

StorePilot uses an AI provider layer rather than coupling application logic directly to a single AI implementation.

The AI workflow is conceptually:

```text
PostgreSQL
    │
    ▼
Business Services
    │
    ▼
Relevant Business Statistics
    │
    ▼
AI Context Builder
    │
    ▼
Gemini Provider
    │
    ▼
AI Response
    │
    ▼
Frontend AI Assistant / Insights
```

The application derives important business statistics from its own database and provides those facts as context to the AI layer.

This helps prevent the language model from becoming the source of truth for transactional or financial calculations.

If the Gemini API key is unavailable, the application is designed to continue operating while AI functionality is unavailable or degraded.

---

## 🎨 Design System

StorePilot uses a custom design system based on CSS custom properties.

### Theme

**Light mode**

* Green primary accent
* Light surfaces
* Dark text

**Dark mode**

* Purple primary accent
* Dark surfaces
* Light text

### Design characteristics

* Responsive layouts
* Consistent spacing tokens
* Reusable card components
* Consistent form controls
* Accessible focus states
* Responsive tables
* Skeleton loading states
* Toast notifications
* Modal/dialog system
* Reduced-motion support
* Theme-aware branding

The detailed visual rules are documented in:

```text
UI_GUIDELINES.md
```

---

## 📱 Responsive Design

The interface adapts across several viewport sizes.

### Desktop

* Full sidebar
* Dashboard grid
* Integrated AI assistant
* Multi-column analytics

### Tablet

* Reduced dashboard columns
* Adaptive sidebar
* Overlay AI assistant when necessary

### Mobile

* Off-canvas navigation drawer
* Single-column layouts
* Scrollable data tables
* Floating AI assistant
* Responsive forms and dialogs

The current project status records responsive verification at widths including **390px and 375px**.

---

## 🔍 API

The backend exposes REST endpoints for the major application domains.

Examples include routes for:

```text
Authentication
Products
Categories
Inventory
Suppliers
Customers
Sales
Purchases
Dashboard
Reports
Notifications
AI
Global Search
```

FastAPI automatically provides interactive API documentation through:

```text
/docs
```

and:

```text
/redoc
```

when the backend is running.

---

## 🔐 Security Considerations

StorePilot uses several security mechanisms:

* JWT bearer authentication
* Password hashing with bcrypt
* Protected API routes
* Authenticated frontend routes
* Pydantic request validation
* Database transaction handling
* Environment-based secret configuration

### Never commit secrets

Do not upload:

```text
.env
.env.local
API keys
database passwords
private credentials
```

The repository's `.gitignore` excludes environment files and local development artifacts.

---

## 🗃️ Local Development Data

The project includes a database seed system intended to make local development and demonstrations easier.

The seed data represents an Indian retail/grocery environment with example brands and products such as:

* Amul
* Tata
* Maggi
* Parle-G
* Fortune

It also generates historical transactions and inventory information for demonstrating dashboard analytics, reports, and AI features.

---

## 📚 Documentation

Additional project documentation is available in the repository:

| File                 | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `PROJECT.md`         | Project overview and architecture summary          |
| `PROJECT_STATUS.md`  | Current development status and verified milestones |
| `CHANGELOG.md`       | Development history and implemented changes        |
| `UI_GUIDELINES.md`   | Design system and UI rules                         |
| `backend/README.md`  | Backend-specific documentation                     |
| `frontend/README.md` | Frontend-specific documentation                    |

---

## ✅ Current Status

StorePilot's core full-stack implementation is complete.

Current verified areas include:

* Authentication
* Product management
* Inventory
* Suppliers
* Purchases
* Sales
* Dashboard
* Reports
* Notifications
* Global search
* AI assistant
* Gemini integration
* Responsive UI
* Light/dark themes
* Database migrations
* Automated backend testing
* Production frontend build

The project status documentation currently records:

* **15 backend automated tests passing**
* Successful frontend production builds
* Responsive verification at mobile breakpoints

---

## 🔮 Future Improvements

Potential future improvements include:

* Production deployment
* Cloud database configuration
* Persistent object/file storage
* Multi-store support
* More granular user roles and permissions
* Advanced inventory forecasting
* More AI-powered business workflows
* Automated reorder suggestions
* Supplier performance analytics
* Advanced sales forecasting
* More comprehensive end-to-end testing
* Production observability and monitoring

---

## 📸 Screenshots & Demo

Screenshots and additional visual documentation can be added here as the public demo is prepared.

Recommended future additions:

```text
Landing Page
Dashboard
Inventory
Products
Sales
Reports
AI Assistant
Dark Mode
Mobile Layout
```

---

## 🏗️ Development

StorePilot is structured as a monorepo containing independent frontend and backend applications.

```text
Frontend
React + Vite
    │
    │ REST API
    ▼
Backend
FastAPI
    │
    ├── SQLAlchemy
    │
    ├── PostgreSQL
    │
    └── Gemini AI
```

This separation allows the frontend and backend to be developed, tested, and deployed independently.

---

## 📄 License

No open-source license has currently been specified for this repository.

If this project is intended to be publicly reusable, an appropriate license can be added later.

---

## 👨‍💻 Project

**StorePilot** — Smart Retail Management Platform

Built as a full-stack software project combining retail operations, business analytics, responsive UI design, database-backed workflows, and AI-assisted business intelligence.

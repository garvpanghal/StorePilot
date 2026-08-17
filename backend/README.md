# StorePilot — Backend API

This is the backend API for the StorePilot retail management platform. It is built using Python + FastAPI, SQLAlchemy ORM, Alembic migrations, PostgreSQL, and integrates with Gemini AI for analytics and suggestions.

---

## 🛠️ Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: [PostgreSQL 18](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy 2.x](https://www.sqlalchemy.org/)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **AI/LLM**: [Google Gemini Pro](https://ai.google.dev/) via `google-generativeai` SDK
- **Security**: JWT tokens (`python-jose`) and password hashing (`bcrypt`)
- **Testing**: [pytest](https://docs.pytest.org/) using isolated memory SQLite instance

---

## 📂 Directory Structure

```
backend/
├── app/
│   ├── main.py             # FastAPI bootstrap, CORS, global error handling
│   ├── seed.py             # Idempotent demo database seeding script
│   │
│   ├── core/
│   │   ├── config.py       # Configuration settings via Pydantic settings
│   │   ├── security.py     # Password hashing and JWT generation
│   │   └── logging.py      # App-wide logging setup
│   │
│   ├── db/
│   │   ├── session.py      # SQLAlchemy engine, SessionLocal and get_db
│   │   └── base.py         # Declarative Base for models
│   │
│   ├── models/             # 12 SQLAlchemy models mapped to PostgreSQL
│   │   ├── user.py, store.py, category.py, supplier.py, product.py
│   │   ├── customer.py, sale.py, purchase.py, inventory.py, notification.py
│   │   └── __init__.py
│   │
│   ├── schemas/            # Pydantic schemas validating REST inputs/outputs
│   │   ├── auth.py, user.py, product.py, category.py, supplier.py, customer.py
│   │   ├── sale.py, purchase.py, inventory.py, notification.py, dashboard.py, report.py
│   │   └── __init__.py
│   │
│   ├── api/
│   │   ├── deps.py         # API Dependency injection (get_current_user)
│   │   └── routes/         # REST API endpoints for all sub-modules
│   │
│   └── services/           # Reusable service layer encapsulating business logic
│       ├── product_service.py, inventory_service.py, supplier_service.py
│       ├── purchase_service.py, sale_service.py, dashboard_service.py
│       ├── report_service.py, notification_service.py, ai_service.py
│       └── __init__.py
│
├── alembic/                # Database migrations history
├── tests/                  # Pytest unit testing suite (auth, catalog, transactions)
├── .env.example            # Environment variables template
├── requirements.txt        # Python backend dependencies
└── README.md               # This documentation file
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

Key environment configurations:
- `DATABASE_URL`: Connection string (e.g. `postgresql+psycopg://postgres:panghal@localhost:5432/storepilot`)
- `SECRET_KEY`: Long random string used to sign JWT tokens.
- `GEMINI_API_KEY`: API key for Gemini. If left empty, AI features will be disabled gracefully, displaying an warning status in the frontend rather than crashing the system.

---

## 🚀 Running the Backend locally

1. **Activate the virtual environment**:
   * **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
   * **Linux/macOS**: `source .venv/bin/activate`

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

4. **Seed the database (essential for initial admin login & demo data)**:
   ```bash
   $env:PYTHONIOENCODING='utf-8'; python -m app.seed
   ```
   *Creates standard user `admin@storepilot.com` / `storepilot123`, 70+ products (Amul, Maggi, Tata), 300+ sales ledger items, categories, and inventory transactions.*

5. **Start the API Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🧪 Testing

We run our tests using `pytest` on an isolated SQLite database loaded in memory, ensuring local developer databases are untouched:
```bash
pytest tests/ -v
```

---

## 🩺 API Documentation

- **Swagger interactive UI**: `http://127.0.0.1:8000/docs`
- **ReDoc reference**: `http://127.0.0.1:8000/redoc`

---

## 🔍 Search API Endpoint

- **Path**: `GET /api/search?q=<query>`
- **Parameters**: `q` (string, min length: 2)
- **Security**: Requires bearer JWT authorization.
- **Output JSON format**:
  ```json
  {
    "products": [{"id": 1, "name": "Amul Milk", "sku": "M1", "selling_price": 30.0, "current_stock": 10}],
    "sales": [{"id": 1, "invoice_number": "INV-1", "customer_name": "Walk-in", "total": 120.0, "created_at": "..."}],
    "purchases": [{"id": 1, "supplier_name": "Tata", "total": 450.0, "created_at": "..."}],
    "suppliers": [{"id": 1, "name": "Amul", "contact_person": "J. Doe", "phone": "..."}],
    "customers": [{"id": 1, "name": "Rahul", "email": "...", "phone": "..."}]
  }
  ```

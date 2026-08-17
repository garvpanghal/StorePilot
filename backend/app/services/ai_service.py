"""
AI service — abstraction layer for AI providers.
Architecture:
  Database → Analytics/business logic → Structured context → AI → Natural-language response

AI NEVER calculates authoritative business numbers.
The app calculates structured facts first, then provides them as context.
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.config import settings
from app.core.logging import logger
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.category import Category
from app.models.purchase import Purchase
from app.services import dashboard_service, inventory_service


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    def generate(self, prompt: str, context: str = "") -> str:
        """Generate a response given a prompt and optional context."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this provider is configured and available."""
        pass


class GeminiProvider(AIProvider):
    """Google Gemini AI provider."""

    def __init__(self):
        self._model = None
        self._api_key = settings.GEMINI_API_KEY

    def is_available(self) -> bool:
        return bool(self._api_key)

    def _get_model(self):
        if self._model is None and self._api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self._api_key)
                self._model = genai.GenerativeModel("gemini-2.0-flash")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self._model = None
        return self._model

    def generate(self, prompt: str, context: str = "") -> str:
        model = self._get_model()
        if not model:
            return "AI service is not available. Please configure GEMINI_API_KEY."

        full_prompt = f"""You are StorePilot AI, an intelligent retail management assistant.
You help store managers understand their business data and make better decisions.

IMPORTANT RULES:
- Only reference data provided in the context below
- Never invent product names, numbers, or statistics
- Be concise and actionable
- Use ₹ for currency (Indian Rupees)
- Format numbers with Indian notation where appropriate

STORE DATA CONTEXT:
{context}

USER QUESTION: {prompt}"""

        try:
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return f"I encountered an error processing your request. Please try again."


# Singleton provider
_provider: Optional[AIProvider] = None


def get_provider() -> AIProvider:
    global _provider
    if _provider is None:
        _provider = GeminiProvider()
    return _provider


def is_ai_available() -> bool:
    return get_provider().is_available()


def build_store_context(db: Session) -> str:
    """Build structured business context for AI from real database data."""
    # Product summary
    products = db.query(Product).all()
    total_products = len(products)
    low_stock = [p for p in products if p.stock_status in ("Low Stock", "Critical")]
    out_of_stock = [p for p in products if p.stock_status == "Out of Stock"]

    # Sales summary (last 30 days)
    from datetime import datetime, timedelta, timezone
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_sales = db.query(Sale).filter(
        Sale.created_at >= thirty_days_ago, Sale.status == "completed"
    ).all()
    total_revenue_30d = sum(float(s.total) for s in recent_sales)
    total_orders_30d = len(recent_sales)

    # Top products
    top = dashboard_service.get_top_products(db, "30d", 10)

    # Category breakdown
    categories = dashboard_service.get_category_sales(db, "30d")

    # Inventory overview
    inv = inventory_service.get_inventory_overview(db)

    context = f"""INVENTORY OVERVIEW:
- Total products: {total_products}
- Total inventory value: ₹{inv['total_stock_value']:,.2f}
- Healthy stock: {inv['healthy_count']} products
- Low stock: {inv['low_stock_count']} products
- Critical stock: {inv['critical_stock_count']} products
- Out of stock: {inv['out_of_stock_count']} products

SALES (Last 30 days):
- Total revenue: ₹{total_revenue_30d:,.2f}
- Total orders: {total_orders_30d}

TOP SELLING PRODUCTS (Last 30 days):
"""
    for t in top:
        context += f"- {t.name}: {t.total_sold} units sold, ₹{t.revenue:,.2f} revenue\n"

    context += "\nCATEGORY SALES:\n"
    for c in categories:
        context += f"- {c.name}: ₹{c.value:,.2f} ({c.percentage}%)\n"

    if low_stock:
        context += "\nLOW/CRITICAL STOCK PRODUCTS:\n"
        for p in low_stock[:15]:
            context += f"- {p.name} (SKU: {p.sku}): {p.current_stock} units left, reorder level: {p.reorder_level}, status: {p.stock_status}\n"

    if out_of_stock:
        context += "\nOUT OF STOCK PRODUCTS:\n"
        for p in out_of_stock[:10]:
            context += f"- {p.name} (SKU: {p.sku})\n"

    return context


def chat(db: Session, message: str) -> str:
    """AI chat — answers questions using real store data as context."""
    provider = get_provider()
    if not provider.is_available():
        return "AI Assistant is not configured. Please set GEMINI_API_KEY in the backend .env file to enable AI features."

    context = build_store_context(db)
    return provider.generate(message, context)


def get_health_score(db: Session) -> dict:
    """Deterministic business health score — calculated by app logic, explained by AI."""
    products = db.query(Product).all()
    total = len(products) or 1

    # Inventory health factors
    healthy_pct = sum(1 for p in products if p.current_stock > p.reorder_level) / total * 100
    low_stock_pct = sum(1 for p in products if 0 < p.current_stock <= p.reorder_level) / total * 100
    out_stock_pct = sum(1 for p in products if p.current_stock <= 0) / total * 100

    # Sales trend (compare last 7 days vs previous 7 days)
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    recent_rev = float(db.query(func.coalesce(func.sum(Sale.total), 0)).filter(
        Sale.created_at >= week_ago, Sale.status == "completed"
    ).scalar())
    prev_rev = float(db.query(func.coalesce(func.sum(Sale.total), 0)).filter(
        Sale.created_at >= two_weeks_ago, Sale.created_at < week_ago, Sale.status == "completed"
    ).scalar())

    # Score calculation (0-100)
    inventory_score = max(0, min(100, healthy_pct - out_stock_pct * 2))
    sales_score = 70  # Base score
    if prev_rev > 0:
        trend = ((recent_rev - prev_rev) / prev_rev) * 100
        sales_score = max(0, min(100, 70 + trend))

    overall = round(inventory_score * 0.4 + sales_score * 0.6)

    metrics = {
        "overall_score": overall,
        "inventory_health": round(healthy_pct, 1),
        "low_stock_rate": round(low_stock_pct, 1),
        "out_of_stock_rate": round(out_stock_pct, 1),
        "revenue_this_week": round(recent_rev, 2),
        "revenue_last_week": round(prev_rev, 2),
        "revenue_trend": round(((recent_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0, 1),
    }

    # Optional AI explanation
    explanation = ""
    provider = get_provider()
    if provider.is_available():
        ctx = f"Business Health Metrics: {metrics}"
        explanation = provider.generate(
            "Provide a brief 2-3 sentence explanation of this business health score. Be specific about what's good and what needs attention.",
            ctx,
        )

    return {"metrics": metrics, "explanation": explanation}


def get_executive_summary(db: Session) -> str:
    """Generate an executive summary using real data."""
    provider = get_provider()
    if not provider.is_available():
        return "AI is not configured. Set GEMINI_API_KEY to enable executive summaries."

    context = build_store_context(db)
    return provider.generate(
        "Generate a concise executive summary of this store's performance. Include: overall performance, positive trends, problems or risks, and 2-3 recommended actions. Keep it under 200 words.",
        context,
    )


def explain_chart(db: Session, chart_type: str, chart_data: dict) -> str:
    """Explain chart data — AI receives structured data, cannot invent values."""
    provider = get_provider()
    if not provider.is_available():
        return "AI is not configured."

    context = f"Chart type: {chart_type}\nChart data: {chart_data}"
    return provider.generate(
        "Analyze this chart data. Explain the trend, notable increases or decreases, and any business implications. Be specific — reference the actual data points. Keep it under 150 words.",
        context,
    )


def get_recommendations(db: Session) -> list:
    """Generate AI recommendations based on real business data."""
    provider = get_provider()
    if not provider.is_available():
        # Return deterministic recommendations without AI
        low_products = inventory_service.get_low_stock_products(db)
        recs = []
        for p in low_products[:5]:
            recs.append({
                "type": "reorder",
                "severity": "danger" if p.stock_status == "Critical" else "warning",
                "message": f"Reorder {p.name} — only {p.current_stock} units left (reorder level: {p.reorder_level})",
                "product_id": p.id,
            })
        return recs

    context = build_store_context(db)
    # Get AI recommendations as structured text, then parse
    raw = provider.generate(
        "Based on this store data, provide exactly 5 actionable recommendations. Format each as a single line starting with [REORDER], [INVESTIGATE], [OPPORTUNITY], or [WARNING] followed by the recommendation. Reference specific products and numbers.",
        context,
    )

    # Parse AI response into structured recommendations
    recs = []
    type_map = {
        "[REORDER]": ("reorder", "warning"),
        "[INVESTIGATE]": ("investigate", "info"),
        "[OPPORTUNITY]": ("opportunity", "success"),
        "[WARNING]": ("warning", "danger"),
    }
    for line in raw.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        for prefix, (rtype, severity) in type_map.items():
            if line.upper().startswith(prefix):
                recs.append({
                    "type": rtype,
                    "severity": severity,
                    "message": line[len(prefix):].strip(),
                })
                break
        else:
            if line and len(recs) < 5:
                recs.append({"type": "info", "severity": "info", "message": line})

    return recs[:5]

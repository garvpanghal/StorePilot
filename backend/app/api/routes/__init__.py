from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.products import router as products_router
from app.api.routes.categories import router as categories_router
from app.api.routes.suppliers import router as suppliers_router
from app.api.routes.customers import router as customers_router
from app.api.routes.sales import router as sales_router
from app.api.routes.purchases import router as purchases_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.reports import router as reports_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.ai import router as ai_router
from app.api.routes.search import router as search_router
from app.api.routes.users import router as users_router

# Root router for all API endpoints
api_router = APIRouter()

# Include all routes
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(categories_router)
api_router.include_router(suppliers_router)
api_router.include_router(customers_router)
api_router.include_router(sales_router)
api_router.include_router(purchases_router)
api_router.include_router(inventory_router)
api_router.include_router(dashboard_router)
api_router.include_router(reports_router)
api_router.include_router(notifications_router)
api_router.include_router(ai_router)
api_router.include_router(search_router)
api_router.include_router(users_router)

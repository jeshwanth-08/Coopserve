from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.initiatives import router as initiatives_router
from app.api.routes.service_requests import router as service_requests_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(initiatives_router)
api_router.include_router(service_requests_router)

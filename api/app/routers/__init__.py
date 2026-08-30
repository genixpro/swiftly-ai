"""Feature routers that have been extracted from the compatibility route module."""

from .health import router as health_router
from .reports import router as reports_router

routers = (health_router, reports_router)

__all__ = ["routers"]

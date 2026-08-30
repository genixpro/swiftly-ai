"""FastAPI application assembly.

Endpoint behavior lives in :mod:`app.routes`; this module owns only process
lifecycle and dependency wiring so tests can replace infrastructure cleanly.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

from . import routes
from .repositories import Repositories
from .routers import routers as feature_routers
from .routes import public
from .services.file_storage import extract_available_text, render_document_pages
from .services.reporting import REPORT_TITLES, report_rows
from .settings import settings


MongoFactory = Callable[[str], object]


def create_app(mongo_factory: MongoFactory | None = None) -> FastAPI:
    """Build an application with replaceable infrastructure dependencies."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        routes.configure_logging()
        config = settings()
        factory = mongo_factory or MongoClient
        app.state.mongo = factory(config.mongo_url)
        app.state.db = app.state.mongo[config.mongo_db]
        app.state.repositories = Repositories(app.state.db)
        app.state.db.files.create_index("appraisalId")
        app.state.db.extractions.create_index("fileId")
        routes.seed_or_upgrade_demo(app)
        routes.ensure_demo_comparables(app.state.repositories)
        routes.ensure_demo_zone(app.state.repositories)
        routes.log.info("api started", extra={"appraisalId": "local-demo"})
        yield
        app.state.mongo.close()
        routes.log.info("api stopped")

    application = FastAPI(title="Swiftly local demo API", version="1.0.0", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(routes.router)
    for feature_router in feature_routers:
        application.include_router(feature_router)
    return application


app = create_app()


__all__ = [
    "REPORT_TITLES",
    "app",
    "create_app",
    "extract_available_text",
    "public",
    "render_document_pages",
    "report_rows",
]

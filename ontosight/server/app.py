"""OntoSight FastAPI application.

Creates and configures the FastAPI application with all routes and middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from ontosight.server.routes import meta, data, search, chat


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        Configured FastAPI instance
    """
    app = FastAPI(
        title="OntoSight API",
        description="Core Visualization Engine for Interactive Knowledge Graphs",
        version="0.1.0",
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.head("/api/health")
    @app.get("/api/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {"status": "healthy"}

    # Include routers
    app.include_router(meta.router, prefix="/api", tags=["metadata"])
    app.include_router(data.router, prefix="/api", tags=["data"])
    app.include_router(search.router, prefix="/api", tags=["search"])
    app.include_router(chat.router, prefix="/api", tags=["chat"])

    # Mount static files
    # locating ontosight/static relative to ontosight/server/app.py
    static_dir = Path(__file__).parent.parent / "static"
    if static_dir.exists():
        app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")

    return app


# Create application instance
app = create_app()

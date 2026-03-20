"""CodePulse — AI Developer Intelligence Platform Backend."""

import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from models.db import init_db
from routers import github, analysis, dashboard, chat, ai

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CodePulse API",
    description="AI Developer Intelligence Platform — Analyze developer impact, trace requirements, and detect knowledge risks.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — Allow Vercel frontend domains + local dev
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,https://codepulse.vercel.app,https://codepulse-ai.vercel.app,https://codepulse-app.vercel.app,https://codepulse-intel.vercel.app",
)
origins = [o.strip() for o in cors_origins.split(",")]

# Also allow any *.vercel.app subdomain via regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(github.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(ai.router)


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    init_db()
    # Note: ML model preloading removed for Render free tier (512MB RAM limit).
    # Model will lazy-load on first requirement mapping request.


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global error handler returning consistent JSON error responses."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
        },
    )


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": "CodePulse API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check for Railway/Render deployment monitoring."""
    return {"status": "ok"}


@app.get("/api/health", tags=["Health"])
async def api_health_check():
    """API health check."""
    return {"status": "healthy", "service": "codepulse-api"}

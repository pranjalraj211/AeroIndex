"""
Main FastAPI Application for Real-Time Airfare Price Index (AFPI) Platform.
SIH Project: Automated Web Scraping of Airline & OTA Portals for CPI Augmentation.
"""

from typing import Optional
from backend.app.routers.index import get_index_data
from backend.app.routers.routes import get_routes_data
from backend.app.routers.airlines import get_airlines_data
from backend.app.routers.cpi import get_cpi_comparison
from backend.app.routers.scraper import get_scraper_status, trigger_manual_scrape

# FastAPI-compatible application structure
try:
    from fastapi import FastAPI, Query
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(
        title="MoSPI Real-Time Airfare Price Index (AFPI) API",
        description="Automated High-Frequency Airline and OTA Price Ingestion Engine for Augmenting India's Consumer Price Index (CPI)",
        version="2.4.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def root():
        return {
            "system": "National Airfare Price Index (AFPI) Engine",
            "version": "2.4.0",
            "authority": "MoSPI / MoCA High-Frequency Statistics Division",
            "status": "OPERATIONAL",
            "endpoints": ["/api/index", "/api/routes", "/api/airlines", "/api/cpi-comparison", "/api/scraper-status", "/api/scrape-trigger"]
        }

    @app.get("/api/index")
    def api_index(range_days: int = Query(90, ge=7, le=90)):
        return get_index_data(range_days=range_days)

    @app.get("/api/routes")
    def api_routes(origin: Optional[str] = None, dest: Optional[str] = None):
        return get_routes_data(origin, dest)

    @app.get("/api/airlines")
    def api_airlines():
        return get_airlines_data()

    @app.get("/api/cpi-comparison")
    def api_cpi(
        official_cpi: float = 5.20,
        transport_weight: float = 8.59,
        proposed_weight: float = 9.80,
        afpi_growth: float = 12.8
    ):
        return get_cpi_comparison(
            official_cpi_headline=official_cpi,
            transport_weight=transport_weight,
            proposed_airfare_weight=proposed_weight,
            afpi_growth=afpi_growth
        )

    @app.get("/api/scraper-status")
    def api_scraper_status():
        return get_scraper_status()

    @app.post("/api/scrape-trigger")
    def api_scrape_trigger(route: str = "DEL-BOM", days_ahead: int = 7):
        return trigger_manual_scrape(route=route, days_ahead=days_ahead)

except ImportError:
    # Fallback for environments without FastAPI installed
    app = None

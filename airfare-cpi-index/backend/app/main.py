"""
Main FastAPI Application for Real-Time AirIndex Platform (production mode).
Run with: uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
"""

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.app.routers.index import get_index_data
from backend.app.routers.routes import get_routes_data
from backend.app.routers.airlines import get_airlines_data
from backend.app.routers.cpi import get_cpi_comparison
from backend.app.routers.scraper import get_scraper_status, trigger_manual_scrape
from backend.app.routers.ml import get_fare_prediction, get_30d_forecast, train_model_weights
from backend.app.routers.copilot import query_mospi_copilot, get_atf_simulation, get_udan_status, get_cartel_hhi

# --- adjust this path if your frontend folder lives somewhere else relative to this file ---
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

app = FastAPI(
    title="MoSPI Real-Time AirIndex API",
    description="Automated High-Frequency Airline and OTA Price Ingestion Engine for Augmenting India's CPI",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
def api_root():
    return {
        "system": "National AirIndex API",
        "version": "2.4.0",
        "status": "OPERATIONAL",
        "endpoints": [
            "/api/index", "/api/routes", "/api/airlines", "/api/cpi-comparison",
            "/api/scraper-status", "/api/scrape-trigger", "/api/ml/predict-fare",
            "/api/ml/forecast-30d", "/api/ml/train-model", "/api/copilot/query",
            "/api/copilot/atf-simulator", "/api/copilot/udan-rcs", "/api/copilot/cartel-hhi"
        ]
    }


@app.get("/api/index")
def api_index(range_days: int = Query(90, ge=7, le=1095), route: Optional[str] = None):
    return get_index_data(range_days=range_days, route=route)


@app.get("/api/routes")
def api_routes(origin: Optional[str] = None, dest: Optional[str] = None):
    return get_routes_data(origin, dest)


@app.get("/api/airlines")
def api_airlines():
    return get_airlines_data()


@app.get("/api/cpi-comparison")
def api_cpi(
    official_cpi: float = Query(2.75, ge=-5, le=30),
    transport_weight: float = Query(12.41, gt=0, le=100),
    proposed_weight: float = Query(9.80, gt=0, le=100),
    airindex_growth: float = Query(12.8, ge=-100, le=500)
):
    return get_cpi_comparison(
        official_cpi_headline=official_cpi,
        transport_weight=transport_weight,
        proposed_airfare_weight=proposed_weight,
        airindex_growth=airindex_growth
    )


@app.get("/api/scraper-status")
def api_scraper_status():
    return get_scraper_status()


class ScrapeRequest(BaseModel):
    route: str = Field("DEL-BOM", pattern=r"^[A-Z]{3}-[A-Z]{3}$")
    days_ahead: int = Field(7, ge=0, le=90)


@app.post("/api/scrape-trigger")
def api_scrape_trigger(req: ScrapeRequest):
    return trigger_manual_scrape(route=req.route, days_ahead=req.days_ahead)


@app.get("/api/ml/predict-fare")
def api_predict_fare(
    route_code: str = Query("DEL-BOM", pattern=r"^[A-Z]{3}-[A-Z]{3}$"),
    days: int = Query(7, ge=0, le=365),
    carrier: str = "6E",
    prime: bool = True,
    weekend: bool = False,
    festive: bool = False,
    baggage: bool = True
):
    return get_fare_prediction(
        route_code=route_code, days_to_departure=days, carrier_code=carrier,
        is_prime_hours=prime, is_weekend=weekend, is_festive_season=festive, include_baggage=baggage
    )


@app.get("/api/ml/forecast-30d")
def api_forecast(base_index: float = Query(121.4, gt=0, lt=1000)):
    return get_30d_forecast(base_index=base_index)


@app.get("/api/ml/train-model")
def api_train():
    return train_model_weights()


@app.get("/api/copilot/query")
def api_copilot_query(q: str = Query("What is the inflation trend?", max_length=300)):
    return query_mospi_copilot(prompt=q)


@app.get("/api/copilot/atf-simulator")
def api_atf(change_pct: float = Query(10.0, ge=-50, le=100)):
    return get_atf_simulation(atf_change_pct=change_pct)


@app.get("/api/copilot/udan-rcs")
def api_udan():
    return get_udan_status()


@app.get("/api/copilot/cartel-hhi")
def api_cartel_hhi():
    return get_cartel_hhi()


# --- Static frontend, mounted LAST so it doesn't shadow the /api routes above ---
app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")


@app.get("/")
def serve_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")

"""
FastAPI Router for Scraper Telemetry, Worker Health, Proxy Latencies, and On-Demand Harvest Triggers.
"""

from typing import Dict, Any
from datetime import datetime
from backend.app.services.mock_data import get_scraper_telemetry


def get_scraper_status() -> Dict[str, Any]:
    """
    Returns full telemetry dashboard data for all 9 scraping workers.
    """
    return {
        "status": "success",
        "telemetry": get_scraper_telemetry(),
        "server_time": datetime.now().isoformat()
    }


def trigger_manual_scrape(route: str = "DEL-BOM", days_ahead: int = 7) -> Dict[str, Any]:
    """
    Simulates a live automated scraping harvest cycle across all 9 airline and OTA portals.
    """
    return {
        "status": "success",
        "job_id": "JOB-AIRINDEX-20260928-8931",
        "route": route,
        "departure_window": f"{days_ahead} days ahead",
        "started_at": datetime.now().isoformat(),
        "harvested_records_count": 48,
        "sources_queried": ["IndiGo Direct", "Air India", "Akasa Air", "SpiceJet", "MakeMyTrip", "EaseMyTrip", "Cleartrip", "Ixigo", "Google Flights"],
        "min_fare_discovered": 4820.0,
        "avg_fare_discovered": 5340.0,
        "max_fare_discovered": 9150.0,
        "data_provenance_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "audit_status": "VERIFIED_AND_INGESTED_INTO_TIMESCALE_LEDGER"
    }

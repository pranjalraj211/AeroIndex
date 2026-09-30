"""
FastAPI Router for Scraper Telemetry, Worker Health, Proxy Latencies, and On-Demand Harvest Triggers.
"""

import hashlib
import uuid
from typing import Dict, Any
from datetime import datetime, date, timedelta
from backend.app.services.mock_data import get_scraper_telemetry
from backend.app.scrapers.airline_scrapers import IndiGoScraper, AirIndiaScraper, AkasaAirScraper, SpiceJetScraper
from backend.app.scrapers.ota_scrapers import MakeMyTripScraper, EaseMyTripScraper, CleartripScraper, IxigoScraper


def get_scraper_status() -> Dict[str, Any]:
    """
    Returns full telemetry dashboard data for all 9 scraping workers.
    """
    return {
        "status": "success",
        "telemetry": get_scraper_telemetry(),
        "server_time": datetime.now().isoformat()
    }


SCRAPERS = [
    IndiGoScraper, AirIndiaScraper, AkasaAirScraper, SpiceJetScraper,
    MakeMyTripScraper, EaseMyTripScraper, CleartripScraper, IxigoScraper
]

def trigger_manual_scrape(route: str = "DEL-BOM", days_ahead: int = 7) -> Dict[str, Any]:
    """
    Runs every registered scraper against one route/departure-date and summarises the harvest.
    """
    origin, _, dest = route.upper().partition("-")
    if len(origin) != 3 or len(dest) != 3:
        raise ValueError("route must look like 'DEL-BOM'")

    departure_date = (date.today() + timedelta(days=days_ahead)).isoformat()

    fares = []
    sources_queried = []
    for scraper_class in SCRAPERS:
        scraper = scraper_class()
        fares.extend(scraper.fetch_fares(origin, dest, departure_date))
        sources_queried.append(scraper.portal_name)

    if not fares:
        return {"status": "error", "message": "no fares harvested", "route": route}

    totals = [f["total_fare"] for f in fares]
    # Hash of every individual fare's hash: if even one fare changes, this changes too.
    batch_hash = hashlib.sha256(
        "".join(sorted(f["provenance_hash"] for f in fares)).encode("utf-8")
    ).hexdigest()

    return {
        "status": "success",
        "data_mode": "SIMULATED",
        "job_id": f"JOB-{datetime.now():%Y%m%d-%H%M%S}-{uuid.uuid4().hex[:4]}",
        "route": route,
        "departure_date": departure_date,
        "departure_window": f"{days_ahead} days ahead",
        "started_at": datetime.now().isoformat(),
        "harvested_records_count": len(fares),
        "sources_queried": sources_queried,
        "min_fare_discovered": min(totals),
        "avg_fare_discovered": round(sum(totals) / len(totals), 1),
        "max_fare_discovered": max(totals),
        "data_provenance_hash": batch_hash,
        "audit_status": "SIMULATED_BATCH_HASHED"
    }

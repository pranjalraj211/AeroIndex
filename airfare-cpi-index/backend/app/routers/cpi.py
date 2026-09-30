"""
FastAPI Router for MoSPI CPI Augmentation & Inflation Nowcasting Simulator.
"""

from typing import Dict, Any
from backend.app.services.index_engine import StatisticalIndexEngine
from backend.app.services.config import (
    OFFICIAL_HEADLINE_CPI_YOY, TRANSPORT_WEIGHT_PCT, AIRFARE_WEIGHT_IN_TRANSPORT_PCT,
    N_ROUTES_MONITORED, N_SOURCES, AVG_DEPARTURE_WINDOWS_SCRAPED_PER_DAY
)


def get_cpi_comparison(
    official_cpi_headline: float = OFFICIAL_HEADLINE_CPI_YOY,
    transport_weight: float = TRANSPORT_WEIGHT_PCT,
    proposed_airfare_weight: float = AIRFARE_WEIGHT_IN_TRANSPORT_PCT,
    airindex_growth: float = 12.8
) -> Dict[str, Any]:
    """
    Computes inflation nowcasting impact by simulating modern reweighting of high-frequency AirIndex.
    """
    sim_result = StatisticalIndexEngine.compute_cpi_augmentation(
        official_headline_cpi=official_cpi_headline,
        official_transport_weight=transport_weight,
        proposed_airfare_weight_in_transport=proposed_airfare_weight,
        realtime_airindex_growth_yoy=airindex_growth
    )
    
    monthly_inputs = [
        # month,      official_cpi, airindex_index, airindex_yoy
        ("Apr 2026",  4.83,         108.4,           9.1),
        ("May 2026",  4.75,         111.2,           9.6),
        ("Jun 2026",  5.08,         116.5,          10.8),
        ("Jul 2026",  5.35,         119.8,          11.9),
        ("Aug 2026",  5.12,         118.2,          12.3),
        ("Sep 2026",  5.20,         121.4,          12.8),
    ]
    historical_comparison = []
    for month, off_cpi, airindex_val, airindex_yoy in monthly_inputs:
        month_sim = StatisticalIndexEngine.compute_cpi_augmentation(
            official_headline_cpi=off_cpi,
            realtime_airindex_growth_yoy=airindex_yoy
        )
        historical_comparison.append({
            "month": month,
            "official_cpi": off_cpi,
            "augmented_cpi": month_sim["augmented_cpi_headline"],
            "airindex_index": airindex_val,
        })
    
    return {
        "status": "success",
        "simulation": sim_result,
        "historical_monthly_comparison": historical_comparison,
        "mospi_methodology_gap": {
            "current_frequency": "Monthly manual price quotation survey (1-2 quotes per center, lagged 15-45 days)",
            "airindex_automated_frequency": f"Real-time continuous web scraping (~{N_ROUTES_MONITORED * N_SOURCES * AVG_DEPARTURE_WINDOWS_SCRAPED_PER_DAY:,} observations/day, 0-day lag)",
            "basket_coverage": f"Expands from 12 static airport centers to all {N_ROUTES_MONITORED} DGCA scheduled domestic routes with dynamic advance-booking weights"
        }
    }

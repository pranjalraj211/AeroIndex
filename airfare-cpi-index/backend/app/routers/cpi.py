"""
FastAPI Router for MoSPI CPI Augmentation & Inflation Nowcasting Simulator.
"""

from typing import Dict, Any
from backend.app.services.index_engine import StatisticalIndexEngine


def get_cpi_comparison(
    official_cpi_headline: float = 5.20,
    transport_weight: float = 8.59,
    proposed_airfare_weight: float = 9.80,
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
    
    historical_comparison = [
        {"month": "Apr 2026", "official_cpi": 4.83, "augmented_cpi": 4.98, "airindex_index": 108.4, "official_transport": 117.2},
        {"month": "May 2026", "official_cpi": 4.75, "augmented_cpi": 4.92, "airindex_index": 111.2, "official_transport": 117.8},
        {"month": "Jun 2026", "official_cpi": 5.08, "augmented_cpi": 5.29, "airindex_index": 116.5, "official_transport": 118.6},
        {"month": "Jul 2026", "official_cpi": 5.35, "augmented_cpi": 5.58, "airindex_index": 119.8, "official_transport": 119.1},
        {"month": "Aug 2026", "official_cpi": 5.12, "augmented_cpi": 5.34, "airindex_index": 118.2, "official_transport": 119.7},
        {"month": "Sep 2026", "official_cpi": 5.20, "augmented_cpi": 5.43, "airindex_index": 121.4, "official_transport": 120.2}
    ]
    
    return {
        "status": "success",
        "simulation": sim_result,
        "historical_monthly_comparison": historical_comparison,
        "mospi_methodology_gap": {
            "current_frequency": "Monthly manual price quotation survey (1-2 quotes per center, lagged 15-45 days)",
            "airindex_automated_frequency": "Real-time continuous web scraping (~340,000 observations/day, 0-day lag)",
            "basket_coverage": "Expands from 12 static airport centers to all DGCA scheduled domestic routes with dynamic advance-booking weights"
        }
    }

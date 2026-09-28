"""
FastAPI Router for Carrier Pricing Dynamics and Direct Airline vs OTA Markup Margins.
"""

from typing import List, Dict, Any
from backend.app.services.mock_data import AIRLINES_METADATA, OTA_PORTALS_METADATA


def get_airlines_data() -> Dict[str, Any]:
    """
    Returns airline market shares, average domestic fares, and OTA convenience fee premiums.
    """
    return {
        "status": "success",
        "airlines": AIRLINES_METADATA,
        "ota_portals": OTA_PORTALS_METADATA,
        "insights": {
            "lowest_fare_carrier": "Akasa Air (QP) - Avg ₹4,980",
            "highest_market_share": "IndiGo (6E) - 61.4%",
            "average_ota_convenience_fee": "₹180 - ₹350 per passenger segment",
            "fare_dispersion_coefficient": "18.4% across 0-7 day booking windows"
        }
    }

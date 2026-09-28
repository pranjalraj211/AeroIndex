"""
FastAPI Router for Indian Domestic Routes, Matrix, Geo-Spatial Airport Nodes, and Sparklines.
"""

from typing import List, Dict, Any, Optional
from backend.app.services.mock_data import generate_routes_summary, AIRPORTS


def get_routes_data(origin: Optional[str] = None, dest: Optional[str] = None) -> Dict[str, Any]:
    """
    Returns domestic route matrix, fares, and geospatial node metadata.
    """
    routes = generate_routes_summary()
    if origin:
        routes = [r for r in routes if r["origin_code"] == origin.upper()]
    if dest:
        routes = [r for r in routes if r["dest_code"] == dest.upper()]
        
    return {
        "status": "success",
        "total_routes": len(routes),
        "routes": routes,
        "airports": AIRPORTS
    }

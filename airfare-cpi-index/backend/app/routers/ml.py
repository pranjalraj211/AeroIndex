"""
FastAPI Router for Machine Learning Nowcasting, Price Prediction & Model Training Sandbox.
"""

from typing import Dict, Any, Optional
from backend.app.services.ml_engine import AirfareMLEngine
from backend.app.services.mock_data import ROUTES_METADATA


def get_fare_prediction(
    route_code: str = "DEL-BOM",
    days_to_departure: int = 7,
    carrier_code: str = "6E",
    is_prime_hours: bool = True,
    is_weekend: bool = False,
    is_festive_season: bool = False,
    include_baggage: bool = True
) -> Dict[str, Any]:
    """
    Returns real-time ML predicted fare and decomposition.
    """
    route_info = next((r for r in ROUTES_METADATA if r["code"] == route_code), None)
    dist_km = route_info["distance_km"] if route_info else 1148
    origin = route_info["origin"] if route_info else "DEL"
    destination = route_info["dest"] if route_info else "BOM"

    prediction = AirfareMLEngine.predict_fare(
        origin=origin,
        destination=destination,
        distance_km=dist_km,
        days_to_departure=days_to_departure,
        carrier_code=carrier_code,
        is_prime_hours=is_prime_hours,
        is_weekend=is_weekend,
        is_festive_season=is_festive_season,
        include_baggage=include_baggage
    )

    return {
        "status": "success",
        "route_code": route_code,
        "origin": origin,
        "destination": destination,
        "distance_km": dist_km,
        "carrier_code": carrier_code,
        "days_to_departure": days_to_departure,
        "prediction": prediction
    }


def get_30d_forecast(base_index: float = 121.4) -> Dict[str, Any]:
    """
    Returns 30-day forward looking price index forecast with 95% confidence intervals.
    """
    forecast_series = AirfareMLEngine.generate_30d_forecast(base_index=base_index)
    return {
        "status": "success",
        "model": "ARIMA(2,1,2) + Log-Hedonic Ridge Nowcaster",
        "horizon_days": 30,
        "forecast_series": forecast_series
    }


def train_model_weights(
    learning_rate: float = 0.01,
    epochs: int = 150,
    regularization_lambda: float = 0.05
) -> Dict[str, Any]:
    """
    Executes training across the 6 Mega-Metro corridors (DEL-BOM, BOM-DEL, BLR-BOM, BOM-BLR, BLR-DEL, DEL-BLR).
    """
    return AirfareMLEngine.train_metro_triangle(epochs=epochs)

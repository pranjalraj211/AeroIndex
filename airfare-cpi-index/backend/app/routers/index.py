from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from backend.app.services.mock_data import (
    generate_historical_365d_data,
    generate_multiyear_time_series,
    YEARLY_MACRO_METRICS
)
from backend.app.services.config import (
    N_ROUTES_MONITORED,
    N_SOURCES,
    AVG_DEPARTURE_WINDOWS_SCRAPED_PER_DAY
)

def get_advance_booking_curve() -> List[Dict[str, Any]]:
    return [
        {"tier": "30+ Days Advance", "days": "30-60d", "avg_fare_inr": 3850, "index_factor": 74.0, "description": "Early Bird Base"},
        {"tier": "15–30 Days Advance", "days": "15-30d", "avg_fare_inr": 4620, "index_factor": 88.8, "description": "Standard Booking Window"},
        {"tier": "8–14 Days Advance", "days": "8-14d", "avg_fare_inr": 5890, "index_factor": 113.2, "description": "Moderate Surge"},
        {"tier": "4–7 Days Advance", "days": "4-7d", "avg_fare_inr": 7450, "index_factor": 143.2, "description": "High Demand Escalation"},
        {"tier": "0–3 Days (Last Minute)", "days": "0-3d", "avg_fare_inr": 11200, "index_factor": 215.3, "description": "Peak Dynamic Pricing / Distress"}
    ]


def get_monthly_comparison_matrix(multiyear_series: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Computes side-by-side monthly average comparison across 2024, 2025, 2026.
    """
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    matrix = []
    
    for m in months:
        p24 = [p["headline_index"] for p in multiyear_series if p["year"] == 2024 and p["month"] == m]
        p25 = [p["headline_index"] for p in multiyear_series if p["year"] == 2025 and p["month"] == m]
        p26 = [p["headline_index"] for p in multiyear_series if p["year"] == 2026 and p["month"] == m]
        
        avg24 = round(sum(p24) / len(p24), 2) if p24 else 100.0
        avg25 = round(sum(p25) / len(p25), 2) if p25 else round(avg24 * 1.108, 2)
        avg26 = round(sum(p26) / len(p26), 2) if p26 else round(avg25 * 1.124, 2)
        
        yoy_growth_25 = round(((avg25 - avg24) / avg24) * 100, 1)
        yoy_growth_26 = round(((avg26 - avg25) / avg25) * 100, 1)
        
        matrix.append({
            "month": m,
            "index_2024": avg24,
            "index_2025": avg25,
            "index_2026": avg26,
            "fare_2024": round(4620 * (avg24 / 100)),
            "fare_2025": round(4620 * (avg25 / 100)),
            "fare_2026": round(4620 * (avg26 / 100)),
            "yoy_growth_2025": f"+{yoy_growth_25}%",
            "yoy_growth_2026": f"+{yoy_growth_26}%"
        })
        
    return matrix


def get_index_data(
    range_days: int = 365,
    year: Optional[str] = "ALL",
    route: Optional[str] = None,
    cabin: Optional[str] = "ECONOMY",
    advance_window: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns aggregated AirIndex time-series across full 3-year horizon (2024, 2025, 2026).
    """
    full_3y = generate_multiyear_time_series()
    
    if year in ["2024", "2025", "2026"]:
        target_year = int(year)
        filtered_series = [p for p in full_3y if p["year"] == target_year]
    else:
        filtered_series = full_3y[-range_days:] if range_days < len(full_3y) else full_3y
        
    current_pt = full_3y[-1]
    prev_week_pt = full_3y[-8]
    prev_month_pt = full_3y[-31]
    prev_year_pt = full_3y[-366] if len(full_3y) > 366 else full_3y[0]
    
    headline_val = current_pt["headline_index"]
    dod_pct = current_pt["dod_change_pct"]
    wow_pct = round(((headline_val - prev_week_pt["headline_index"]) / prev_week_pt["headline_index"]) * 100, 2)
    mom_pct = round(((headline_val - prev_month_pt["headline_index"]) / prev_month_pt["headline_index"]) * 100, 2)
    def trailing_7d_avg(series, end_offset):
        """Average of the 7 days ending `end_offset` days before the most recent point.
        end_offset=0 means the most recent 7 days; end_offset=365 means the same
        7-day window one year earlier. Averaging cancels out weekday swings."""
        end_idx = len(series) - end_offset
        window = series[max(0, end_idx - 7):end_idx]
        return sum(p["headline_index"] for p in window) / len(window)

    curr_7d_avg = trailing_7d_avg(full_3y, 0)
    year_ago_7d_avg = trailing_7d_avg(full_3y, 365) if len(full_3y) > 372 else curr_7d_avg
    yoy_pct = round(((curr_7d_avg - year_ago_7d_avg) / year_ago_7d_avg) * 100, 2) 
    
    return {
        "status": "success",
        "headline_number": headline_val,
        "dod_change_pct": dod_pct,
        "wow_change_pct": wow_pct,
        "mom_change_pct": mom_pct,
        "yoy_change_pct": yoy_pct,
        "base_period": "2024=100 (DGCA Passenger Volume Weighted)",
        "total_routes_monitored": N_ROUTES_MONITORED,
        "total_fares_today": N_ROUTES_MONITORED * N_SOURCES * AVG_DEPARTURE_WINDOWS_SCRAPED_PER_DAY,
        "last_updated": datetime.now().isoformat(),
        "time_series_3y": full_3y,
        "time_series_365d": full_3y[-365:],
        "time_series_filtered": filtered_series,
        "yearly_macro_metrics": YEARLY_MACRO_METRICS,
        "monthly_comparison_matrix": get_monthly_comparison_matrix(full_3y),
        "advance_booking_curve": get_advance_booking_curve()
    }

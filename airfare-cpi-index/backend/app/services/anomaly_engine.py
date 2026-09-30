"""
AI Cartelization Detector, Anti-Competitive Price Gouging, and ATF Fuel Elasticity Engine.
Designed for DGCA (Directorate General of Civil Aviation) and CCI (Competition Commission of India)
regulatory oversight within the MoSPI AirIndex ecosystem.
"""

import math
from typing import Dict, Any, List


class RegulatoryAnomalyEngine:
    """
    Analyzes market concentration (HHI), parallel pricing collusion,
    festival price gouging, and Aviation Turbine Fuel (ATF) pass-through dynamics.
    """

    MARKET_SHARES_NAMED = {   # everyone we can name individually
        "IndiGo (6E)": 61.4,
        "Air India Group (AI)": 26.8,
        "Akasa Air (QP)": 5.2,
        "SpiceJet (SG)": 4.1,
    }
    MARKET_SHARE_OTHERS = 2.5   # remainder, lumped as "Others"

    @staticmethod
    def calculate_hhi(market_shares: List[float]) -> Dict[str, Any]:
        """
        Herfindahl-Hirschman Index (HHI) for market concentration:
        HHI = Sum of squared market share percentages.
        - Below 1,500: Competitive
        - 1,500 to 2,500: Moderately Concentrated
        - Above 2,500: Highly Concentrated (Oligopoly / High Collusion Risk)
        """
        hhi = sum(s ** 2 for s in market_shares)
        if hhi > 2500:
            classification = "HIGHLY_CONCENTRATED_OLIGOPOLY"
            risk_level = "HIGH"
        elif hhi >= 1500:
            classification = "MODERATELY_CONCENTRATED"
            risk_level = "MEDIUM"
        else:
            classification = "COMPETITIVE_MARKET"
            risk_level = "LOW"

        return {
            "hhi_index": round(hhi, 1),
            "classification": classification,
            "collusion_risk_level": risk_level,
            "threshold_reference": "CCI / US DOJ Horizontal Merger Guidelines"
        }

    @staticmethod
    def detect_surge_price_gouging(
        route_code: str,
        current_fare: float,
        historic_median_fare: float,
        days_to_departure: int,
        is_emergency_event: bool = False
    ) -> Dict[str, Any]:
        """
        Flags exploitative dynamic pricing surges (e.g. >2.8x median fare during festival/weather disruptions).
        """
        surge_ratio = current_fare / historic_median_fare if historic_median_fare > 0 else 1.0
        is_gouging = False
        severity = "NORMAL"

        if surge_ratio >= 2.5:
            is_gouging = True
            severity = "CRITICAL_GOUGING" if is_emergency_event or days_to_departure > 3 else "HIGH_SURGE"
        elif surge_ratio >= 1.8:
            severity = "ELEVATED_DEMAND"

        excess_premium_inr = max(0.0, current_fare - (historic_median_fare * 1.5))

        return {
            "route_code": route_code,
            "current_fare_inr": current_fare,
            "historic_median_inr": historic_median_fare,
            "surge_multiplier": round(surge_ratio, 2),
            "is_price_gouging": is_gouging,
            "severity": severity,
            "excess_consumer_cost_inr": round(excess_premium_inr, 0),
            "regulatory_action": "ISSUE_DGCA_SHOW_CAUSE_NOTICE" if is_gouging and is_emergency_event else ("MONITOR_SLOT_CAPS" if is_gouging else "NO_ACTION_REQUIRED")
        }

    @staticmethod
    def simulate_atf_fuel_passthrough(
        atf_price_per_kl: float = 98500.0, # Base price INR per kiloliter
        atf_price_change_pct: float = 10.0, # e.g. +10% price revision
        current_headline_cpi: float = 2.75,
        airline_fuel_cost_share_pct: float = 42.0, # Jet fuel accounts for 40-45% of airline OPEX
        passthrough_elasticity: float = 0.78,     # 78% of fuel cost rise is passed to airfares
        passthrough_lag_days: int = 18,            # Time lag for airline revenue management systems to adjust
        airfare_cpi_weight_pct: float = 0.84      # Airfare's share of the total cpi basket
    ) -> Dict[str, Any]:
        """
        Simulates the econometric pass-through of Aviation Turbine Fuel (ATF) revisions
        to consumer airfares and subsequent impact on headline CPI.
        """
        # Estimated airfare price inflation resulting from fuel change
        airfare_impact_pct = (atf_price_change_pct * (airline_fuel_cost_share_pct / 100.0)) * passthrough_elasticity
        airfare_impact_pct = round(airfare_impact_pct, 2)

        # Impact on CPI Transport sub-group (~8.59% weight) and proposed airfare weight (~0.84%)
        cpi_shift_pp = round(airfare_impact_pct * (airfare_cpi_weight_pct / 100.0), 4)
        cpi_shift_bps = round(cpi_shift_pp * 100, 2)
        new_headline_cpi = round(current_headline_cpi + cpi_shift_pp, 2)

        return {
            "atf_base_price_kl_inr": atf_price_per_kl,
            "atf_change_pct": atf_price_change_pct,
            "airfare_projected_shift_pct": airfare_impact_pct,
            "passthrough_lag_days": passthrough_lag_days,
            "cpi_headline_shift_bps": cpi_shift_bps,
            "projected_augmented_cpi": new_headline_cpi,
            "summary_note": f"A {atf_price_change_pct}% revision in ATF jet fuel transmits a {airfare_impact_pct}% increase to consumer ticket prices after a {passthrough_lag_days}-day lag, lifting headline CPI by {cpi_shift_bps} basis points."
        }

    @staticmethod
    def get_udan_rcs_caps() -> List[Dict[str, Any]]:
        """
        Tracks fare ceiling compliance under Ministry of Civil Aviation UDAN (Ude Desh Ka Aam Naagrik).
        """
        return [
            {"route": "DBR-DEL", "origin": "Darbhanga", "dest": "Delhi", "flight_distance_km": 890, "udan_fare_cap_inr": 3500, "current_observed_avg_inr": 3420, "compliance": "COMPLIANT", "subsidy_per_seat_inr": 1200},
            {"route": "JRG-CCU", "origin": "Jharsuguda", "dest": "Kolkata", "flight_distance_km": 420, "udan_fare_cap_inr": 2500, "current_observed_avg_inr": 2450, "compliance": "COMPLIANT", "subsidy_per_seat_inr": 950},
            {"route": "DGH-DEL", "origin": "Deoghar", "dest": "Delhi", "flight_distance_km": 940, "udan_fare_cap_inr": 3600, "current_observed_avg_inr": 4850, "compliance": "CAP_BREACH_ALERT", "subsidy_per_seat_inr": 0},
            {"route": "KQH-BOM", "origin": "Kishangarh", "dest": "Mumbai", "flight_distance_km": 790, "udan_fare_cap_inr": 3200, "current_observed_avg_inr": 3150, "compliance": "COMPLIANT", "subsidy_per_seat_inr": 1100},
            {"route": "PGH-DEL", "origin": "Pantnagar", "dest": "Delhi", "flight_distance_km": 240, "udan_fare_cap_inr": 1800, "current_observed_avg_inr": 1750, "compliance": "COMPLIANT", "subsidy_per_seat_inr": 800}
        ]

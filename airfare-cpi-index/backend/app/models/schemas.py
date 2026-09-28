"""
Database and API Data Schemas for Real-Time AirIndex Platform.
Supports PostgreSQL / TimescaleDB persistence and FastAPI Pydantic serialization.
"""

from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Database Relational Model Schemas (SQLAlchemy / PostgreSQL Schema Definition)
# -----------------------------------------------------------------------------

POSTGRES_SCHEMA_SQL = """
-- ============================================================================
-- MoSPI Real-time AirIndex Schema
-- Optimized for PostgreSQL 15+ / TimescaleDB time-series extensions
-- ============================================================================

CREATE TABLE IF NOT EXISTS fares (
    id BIGSERIAL PRIMARY KEY,
    source_type VARCHAR(20) NOT NULL,            -- 'AIRLINE_DIRECT', 'OTA_PORTAL'
    source_name VARCHAR(50) NOT NULL,            -- 'IndiGo', 'Air India', 'MakeMyTrip', 'EaseMyTrip'
    airline_code VARCHAR(10) NOT NULL,           -- '6E', 'AI', 'QP', 'SG'
    flight_number VARCHAR(20),                   -- e.g. '6E-2041'
    origin VARCHAR(3) NOT NULL,                  -- IATA code: 'DEL', 'BOM', 'BLR', etc.
    destination VARCHAR(3) NOT NULL,             -- IATA code: 'BOM', 'DEL', 'MAA', etc.
    departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_datetime TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    days_to_departure INT NOT NULL,              -- 0 (same day), 1, 7, 14, 30, etc.
    cabin_class VARCHAR(20) DEFAULT 'ECONOMY',   -- 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS'
    base_fare NUMERIC(10, 2) NOT NULL,
    taxes_and_surcharges NUMERIC(10, 2) NOT NULL,
    convenience_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_fare NUMERIC(10, 2) NOT NULL,          -- Effective payable price
    is_nonstop BOOLEAN DEFAULT TRUE,
    baggage_included_kg INT DEFAULT 15,
    provenance_hash VARCHAR(64) NOT NULL         -- SHA-256 hash of raw HTML/JSON snapshot
);

-- TimescaleDB Hypertable conversion (optional for high-volume time series)
-- SELECT create_hypertable('fares', 'scraped_at', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_fares_route_date ON fares (origin, destination, scraped_at);
CREATE INDEX IF NOT EXISTS idx_fares_airline ON fares (airline_code, departure_datetime);
CREATE INDEX IF NOT EXISTS idx_fares_days_to_dep ON fares (days_to_departure);

CREATE TABLE IF NOT EXISTS index_values (
    id SERIAL PRIMARY KEY,
    calculation_date DATE NOT NULL,
    index_type VARCHAR(30) NOT NULL,             -- 'HEADLINE_AIRINDEX', 'LASPEYRES', 'JEVONS', 'FISHER'
    base_period VARCHAR(20) DEFAULT '2024=100',
    route VARCHAR(10) DEFAULT 'NATIONAL_COMPOSITE', -- 'ALL' or specific like 'DEL-BOM'
    advance_window VARCHAR(20) DEFAULT 'ALL_TIERS', -- '0-7d', '8-14d', '15-30d', '30+d'
    index_value NUMERIC(8, 4) NOT NULL,
    dod_change_pct NUMERIC(6, 3),                -- Day-over-Day %
    wow_change_pct NUMERIC(6, 3),                -- Week-over-Week %
    mom_change_pct NUMERIC(6, 3),                -- Month-over-Month %
    sample_size INT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_index_daily_route 
ON index_values (calculation_date, index_type, route, advance_window);

CREATE TABLE IF NOT EXISTS scraper_audit_logs (
    id SERIAL PRIMARY KEY,
    worker_id VARCHAR(50) NOT NULL,
    portal_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,                 -- 'SUCCESS', 'RATE_LIMITED', 'BLOCKED', 'ERROR'
    response_time_ms INT NOT NULL,
    records_harvested INT DEFAULT 0,
    proxy_ip_masked VARCHAR(50),
    user_agent_hash VARCHAR(32),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
"""

# -----------------------------------------------------------------------------
# Pydantic API Models for REST Endpoints
# -----------------------------------------------------------------------------

class FareRecord(BaseModel):
    id: Optional[int] = None
    source_name: str
    source_type: str
    airline_code: str
    origin: str
    destination: str
    departure_date: str
    scraped_at: str
    days_to_departure: int
    cabin_class: str = "ECONOMY"
    base_fare: float
    taxes: float
    total_fare: float
    is_nonstop: bool = True
    provenance_hash: Optional[str] = None


class IndexPoint(BaseModel):
    date: str
    headline_index: float
    laspeyres_index: float
    jevons_index: float
    fisher_index: float
    avg_fare_inr: float
    sample_size: int
    dod_change_pct: float
    wow_change_pct: float
    mom_change_pct: float


class RouteSummary(BaseModel):
    route_code: str
    origin_city: str
    destination_city: str
    distance_km: int
    dgca_passenger_weight_pct: float
    avg_fare_current: float
    avg_fare_prev_week: float
    min_fare: float
    max_fare: float
    pct_change_7d: float
    sparkline_7d: List[float]
    top_carriers: List[str]


class AirlineComparison(BaseModel):
    airline_name: str
    airline_code: str
    market_share_pct: float
    avg_fare_inr: float
    price_index_relative: float
    on_time_performance_pct: float
    ota_markup_premium_inr: float


class CPIImpactSimulation(BaseModel):
    current_official_cpi: float
    transport_subgroup_weight: float
    airfare_subitem_weight_official: float
    airfare_subitem_weight_proposed: float
    airindex_current_growth_yoy: float
    augmented_cpi_headline: float
    cpi_inflation_delta_bps: float
    rbi_target_upper_band: float = 6.0
    rbi_target_lower_band: float = 2.0


class ScraperTelemetry(BaseModel):
    portal_name: str
    category: str  # 'AIRLINE' or 'OTA'
    status: str    # 'ACTIVE', 'DEGRADED', 'RATE_LIMITED'
    success_rate_24h: float
    avg_latency_ms: int
    records_today: int
    last_scraped_at: str
    anti_bot_bypass_pct: float
    active_proxies: int

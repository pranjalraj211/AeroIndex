"""
Single source of truth for every official MoSPI/CPI number used across the app.
Update this file, and only this file, when official figures change.
"""

# CPI 2024 series (base year 2024=100), effective from the Jan 2026 release
CPI_BASE_YEAR = 2024
OFFICIAL_HEADLINE_CPI_YOY = 2.75          # % YoY, Jan 2026 release
TRANSPORT_WEIGHT_PCT = 12.41              # % of total CPI basket (2024 series)
AIRFARE_WEIGHT_IN_TRANSPORT_PCT = 9.80    # your proposed share of transport basket allocated to airfare (assumption — state this in the UI)
OFFICIAL_AIRFARE_GROWTH_YOY = 4.2         # placeholder until you find the official sub-index growth; flag as assumption

# Scale assumptions (derive scraper/route counts from these, don't hardcode elsewhere)
N_ROUTES_MONITORED = 16
N_SOURCES = 8              # 4 airlines + 4 OTAs (Google Flights removed — see Fix 3.5)
AVG_DEPARTURE_WINDOWS_SCRAPED_PER_DAY = 6   # e.g. 3,7,14,30,60,90 days ahead

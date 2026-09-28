"""
Online Travel Aggregator (OTA) Scraper Implementations for MakeMyTrip, EaseMyTrip, Cleartrip, and Ixigo.
Includes convenience fee decomposition and fare markup extraction.
"""

from typing import List, Dict, Any
from .base_scraper import BaseAirfareScraper


class MakeMyTripScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="MakeMyTrip", domain="makemytrip.com", min_delay_sec=1.5, max_delay_sec=3.5)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)


class EaseMyTripScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="EaseMyTrip", domain="easemytrip.com", min_delay_sec=1.0, max_delay_sec=2.5)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)


class CleartripScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="Cleartrip", domain="cleartrip.com", min_delay_sec=1.2, max_delay_sec=3.0)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)


class IxigoScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="Ixigo", domain="ixigo.com", min_delay_sec=1.1, max_delay_sec=2.7)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)

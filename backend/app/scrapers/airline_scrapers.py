"""
Airline Direct Scraper Implementations for IndiGo, Air India, Akasa Air, and SpiceJet.
Includes Playwright / BeautifulSoup structure with full fallback demo mode.
"""

from typing import List, Dict, Any
from .base_scraper import BaseAirfareScraper


class IndiGoScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="IndiGo Direct", domain="goindigo.in", min_delay_sec=0.8, max_delay_sec=2.2)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        """
        Playwright extraction template for IndiGo SPA booking engine.
        In production:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(extra_http_headers=self.session_headers)
                await page.goto(f"https://www.goindigo.in/booking/select.html?origin={origin}&dest={destination}&date={departure_date}")
                await page.wait_for_selector(".flight-card")
        """
        return self.simulate_mock_harvest(origin, destination, departure_date)


class AirIndiaScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="Air India", domain="airindia.com", min_delay_sec=1.2, max_delay_sec=2.8)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)


class AkasaAirScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="Akasa Air", domain="akasaair.com", min_delay_sec=0.7, max_delay_sec=1.8)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)


class SpiceJetScraper(BaseAirfareScraper):
    def __init__(self):
        super().__init__(portal_name="SpiceJet", domain="spicejet.com", min_delay_sec=1.0, max_delay_sec=3.0)

    def fetch_fares(self, origin: str, destination: str, departure_date: str) -> List[Dict[str, Any]]:
        return self.simulate_mock_harvest(origin, destination, departure_date)

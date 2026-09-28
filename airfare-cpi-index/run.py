#!/usr/bin/env python3
"""
Unified Server for Real-Time AirIndex Platform.
Serves both the REST API endpoints and the Interactive Single-Page Application (SPA) frontend.
Zero external dependencies required (uses Python 3 standard library with FastAPI fallback).
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

# Add project root to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from backend.app.routers.index import get_index_data
from backend.app.routers.routes import get_routes_data
from backend.app.routers.airlines import get_airlines_data
from backend.app.routers.cpi import get_cpi_comparison
from backend.app.routers.scraper import get_scraper_status, trigger_manual_scrape
from backend.app.routers.ml import get_fare_prediction, get_30d_forecast, train_model_weights
from backend.app.routers.copilot import query_mospi_copilot, get_atf_simulation, get_udan_status, get_cartel_hhi


class AirIndexUnifiedRequestHandler(SimpleHTTPRequestHandler):
    """
    Handles REST API routing and serves frontend static assets.
    """

    def __init__(self, *args, **kwargs):
        frontend_dir = os.path.join(BASE_DIR, "frontend")
        super().__init__(*args, directory=frontend_dir, **kwargs)

    def _send_json(self, data: dict, status_code: int = 200):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # ---------------- API Routes ----------------
        if path == "/api" or path == "/api/":
            return self._send_json({
                "system": "National AirIndex API",
                "version": "2.4.0",
                "authority": "MoSPI / MoCA High-Frequency Statistics Division",
                "status": "OPERATIONAL",
                "endpoints": [
                    "/api/index",
                    "/api/routes",
                    "/api/airlines",
                    "/api/cpi-comparison",
                    "/api/scraper-status",
                    "/api/scrape-trigger",
                    "/api/ml/predict-fare",
                    "/api/ml/forecast-30d",
                    "/api/ml/train-model",
                    "/api/copilot/query",
                    "/api/copilot/atf-simulator",
                    "/api/copilot/udan-rcs",
                    "/api/copilot/cartel-hhi"
                ]
            })

        if path == "/api/index":
            range_days = int(query.get("range_days", [90])[0])
            route = query.get("route", [None])[0]
            data = get_index_data(range_days=range_days, route=route)
            return self._send_json(data)

        if path == "/api/routes":
            origin = query.get("origin", [None])[0]
            dest = query.get("dest", [None])[0]
            data = get_routes_data(origin=origin, dest=dest)
            return self._send_json(data)

        if path == "/api/airlines":
            data = get_airlines_data()
            return self._send_json(data)

        if path == "/api/cpi-comparison":
            official_cpi = float(query.get("official_cpi", [5.20])[0])
            transport_weight = float(query.get("transport_weight", [8.59])[0])
            proposed_weight = float(query.get("proposed_weight", [9.80])[0])
            airindex_growth = float(query.get("airindex_growth", [12.8])[0])
            data = get_cpi_comparison(
                official_cpi_headline=official_cpi,
                transport_weight=transport_weight,
                proposed_airfare_weight=proposed_weight,
                airindex_growth=airindex_growth
            )
            return self._send_json(data)

        if path == "/api/scraper-status":
            data = get_scraper_status()
            return self._send_json(data)

        if path == "/api/scrape-trigger":
            route = query.get("route", ["DEL-BOM"])[0]
            days_ahead = int(query.get("days_ahead", [7])[0])
            data = trigger_manual_scrape(route=route, days_ahead=days_ahead)
            return self._send_json(data)

        if path == "/api/ml/predict-fare":
            route_code = query.get("route_code", ["DEL-BOM"])[0]
            days = int(query.get("days", [7])[0])
            carrier = query.get("carrier", ["6E"])[0]
            is_prime = query.get("prime", ["true"])[0].lower() == "true"
            is_wknd = query.get("weekend", ["false"])[0].lower() == "true"
            is_fest = query.get("festive", ["false"])[0].lower() == "true"
            baggage = query.get("baggage", ["true"])[0].lower() == "true"
            data = get_fare_prediction(
                route_code=route_code,
                days_to_departure=days,
                carrier_code=carrier,
                is_prime_hours=is_prime,
                is_weekend=is_wknd,
                is_festive_season=is_fest,
                include_baggage=baggage
            )
            return self._send_json(data)

        if path == "/api/ml/forecast-30d":
            base_idx = float(query.get("base_index", [121.4])[0])
            data = get_30d_forecast(base_index=base_idx)
            return self._send_json(data)

        if path == "/api/ml/train-model":
            data = train_model_weights()
            return self._send_json(data)

        if path == "/api/copilot/query":
            prompt = query.get("q", ["What is the inflation trend?"])[0]
            data = query_mospi_copilot(prompt=prompt)
            return self._send_json(data)

        if path == "/api/copilot/atf-simulator":
            change_pct = float(query.get("change_pct", [10.0])[0])
            data = get_atf_simulation(atf_change_pct=change_pct)
            return self._send_json(data)

        if path == "/api/copilot/udan-rcs":
            data = get_udan_status()
            return self._send_json(data)

        if path == "/api/copilot/cartel-hhi":
            data = get_cartel_hhi()
            return self._send_json(data)

        # ---------------- Fallback to Static Frontend Files ----------------
        return super().do_GET()

        # ---------------- Fallback to Static Frontend Files ----------------
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == "/api/scrape-trigger":
            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}
                
            route = payload.get("route", "DEL-BOM")
            days_ahead = int(payload.get("days_ahead", 7))
            data = trigger_manual_scrape(route=route, days_ahead=days_ahead)
            return self._send_json(data)

        return self._send_json({"error": "Endpoint not found"}, 404)


def run_server(port: int = 8000):
    HTTPServer.allow_reuse_address = True
    httpd = None
    target_port = port
    for p in [port, 8001, 8080, 5000, 3000]:
        try:
            server_address = ("0.0.0.0", p)
            httpd = HTTPServer(server_address, AirIndexUnifiedRequestHandler)
            target_port = p
            break
        except OSError:
            continue

    if not httpd:
        print("❌ Could not bind to any candidate port.")
        sys.exit(1)

    print("=" * 75)
    print("🚀 MoSPI Real-time AirIndex Platform - SIH Demo")
    print(f"📡 Web Application running at:  http://localhost:{target_port}")
    print(f"🔗 REST API root endpoint:       http://localhost:{target_port}/api")
    print("=" * 75)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped gracefully.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port=port)

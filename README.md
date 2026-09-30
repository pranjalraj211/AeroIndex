# ✈️ AirIndex: Airfare Price Index for India
### Automated Web Scraping of Airline and OTA Portals for Augmentation of the Consumer Price Index (CPI)

> **Smart India Hackathon (SIH) Problem Statement**  
> **Target Authorities:** Ministry of Statistics and Programme Implementation (MoSPI) & Ministry of Civil Aviation (MoCA) / DGCA  
> **Base Period:** 2024 = 100 (DGCA Domestic Passenger Load Calibrated)

---

## 📌 Executive Summary

India's headline Consumer Price Index (CPI-Combined, Base 2024=100) currently collects domestic airfare quotes manually once a month from a handful of physical airline reservation counters. Over the past decade, Indian domestic civil aviation passenger volume has quadrupled (>150 million annual passengers), rendering the legacy survey methodology prone to **time-lag bias (15–45 days)**, **sampling under-coverage**, and an inability to track **dynamic pricing surges**, **weekend premiums**, and **advance-purchase price escalation**.

This project provides a **production-grade, high-frequency Automated Airfare Price Index (AirIndex)** system that:
1. Automatically crawls **4 direct airlines** (IndiGo, Air India Group, Akasa Air, SpiceJet) and **4 major OTAs** (MakeMyTrip, EaseMyTrip, Cleartrip, Ixigo) across 16 major DGCA city-pairs.
2. Ingests over **768 daily fare quotations** across the entire advance booking horizon (0–3d, 4–7d, 8–14d, 15–30d, 30+d).
3. Applies econometric and statistical index formulas (**Jevons Geometric Mean**, **Laspeyres Quantity-Weighted**, **Hedonic Baggage Normalization**, **IQR Outlier Trimming**).
4. Delivers an interactive **CPI Augmentation & Inflation Nowcasting Simulator** allowing policymakers to recalibrate transport basket weights and forecast headline CPI in real time.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. DISTRIBUTED DATA INGESTION ENGINE                                        │
│   • Headless Playwright / BS4 Scrapers (IndiGo, AI, Akasa, MMT, EMT, Ixigo) │
│   • Residential Proxy Rotation (350+ IPs) + TLS Fingerprint Randomization   │
│   • Politeness Delays (1.0s - 3.0s) + Exponential Backoff on HTTP 429       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. DATA CLEANSING, NORMALIZATION & AUDIT TRAIL                              │
│   • Interquartile Range (IQR) dynamic surge & glitch filtering              │
│   • Hedonic Regression adjustment (15kg baggage & ancillary unbundling)     │
│   • SHA-256 cryptographic snapshot hashing for MoSPI regulatory provenance  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. STATISTICAL INDEX COMPUTE ENGINE                                         │
│   • Elementary Level: Jevons Geometric Mean (Axiomatically transitive)      │
│   • Composite Level: Laspeyres Volume-Weighted by DGCA Route Shares         │
│   • Advance Booking Curve Decomposition (0-3d, 4-7d, 8-14d, 15-30d, 30+d)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. FASTAPI BACKEND & REST API / DISSEMINATION                               │
│   • Endpoints: /api/index, /api/routes, /api/airlines, /api/cpi-comparison  │
│   • Scraper Telemetry: /api/scraper-status, /api/scrape-trigger             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. INTERACTIVE WEB DASHBOARD & POLICY PORTAL                                │
│   • Real-Time AirIndex Time-Series vs MoSPI Transport Benchmark             │
│   • Geospatial Leaflet Route Map of India with price pressure corridors     │
│   • Interactive CPI Inflation Nowcasting Slider & RBI Target Band Gauge     │
│   • Live Scraper Telemetry, Anti-Bot Bypass Metrics & Audit Logs            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Mathematical Rigor & Index Number Formulas

### 1. Jevons Geometric Mean Index (Elementary Aggregates)
Used at the flight-quote level for each route and advance window to eliminate arithmetic substitution bias:
$$I_J = \exp\left( \frac{1}{N} \sum_{i=1}^{N} \ln\left(\frac{p_{t,i}}{p_{0,i}}\right) \right) \times 100 = \left( \prod_{i=1}^{N} \frac{p_{t,i}}{p_{0,i}} \right)^{1/N} \times 100$$

### 2. Laspeyres Quantity-Weighted Composite Index
Aggregates route sub-indices into the national composite index using base-period passenger traffic weights ($w_{0,i}$) from DGCA quarterly statistics:
$$I_L = \frac{\sum_{i=1}^{K} p_{t,i} \, w_{0,i}}{\sum_{i=1}^{K} p_{0,i} \, w_{0,i}} \times 100$$

### 3. Outlier Trimming (IQR Filter)
Eliminates dynamic pricing errors or unrepresentative test fares:
$$\text{Acceptable Range} = [Q_1 - 1.5 \times \text{IQR}, \; Q_3 + 1.5 \times \text{IQR}]$$

### 4. Hedonic Quality Adjustment
Standardizes unbundled zero-baggage LCC fares to a uniform consumer utility basket:
$$\ln(P_i) = \alpha + \beta_1 (\text{Baggage}_{15\text{kg}}) + \beta_2 (\text{SeatSelection}) + \beta_3 (\text{PeakHour}) + \varepsilon_i$$

---

## 🚀 Quick Start & Run Instructions

The platform includes a **zero-dependency unified runner** that launches both the REST API and the Interactive React Frontend on a single port.

### Method 1: Instant Run (Zero External Dependencies)
```bash
# Navigate to the project directory
cd airfare-cpi-index

# Start the unified server
python3 run.py
```
Open your browser and navigate to:
- **Interactive Web App:** `http://localhost:8000`
- **REST API Root:** `http://localhost:8000/api`

---

### Method 2: Running with FastAPI & Uvicorn (Production Mode)
```bash
# Install optional production dependencies
pip install -r requirements.txt

# Run FastAPI backend with live reload
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌐 REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/index` | Returns 90-day AirIndex time series, DoD, WoW, MoM, YoY inflation rates, and advance-purchase curve. |
| `GET` | `/api/routes` | Returns 16 DGCA domestic routes with current fares, distance, weights, and sparklines. |
| `GET` | `/api/airlines` | Returns carrier market shares (IndiGo, AI, Akasa, SG) and OTA markup spreads. |
| `GET` | `/api/cpi-comparison` | Simulates the inflation impact of augmenting CPI with AirIndex and returns monthly comparisons. |
| `GET` | `/api/scraper-status` | Returns telemetry for all 9 scraping workers, proxy pool sizes, latencies, and audit logs. |
| `POST` | `/api/scrape-trigger` | Triggers an on-demand multi-portal harvest job and outputs real-time ingested fares with SHA-256 hash. |

---

## 🛡️ Ethical & Legal Scraping Framework

1. **Robots.txt & Politeness Delays**: All crawlers respect rate-limiting thresholds and implement randomised sleep buffers (1.0s–3.0s) to guarantee zero degradation on airline servers.
2. **Data Minimization (No PII)**: Scrapers solely query publicly accessible search schedules and base fares. No passenger information, login credentials, or user cookies are stored.
3. **Information Technology Act (2000) & DPDP Act (2023) Compliance**: Collection of publicly advertised commercial airline prices for government statistical indexation qualifies as fair use and legitimate non-commercial research.
4. **Data Provenance & Cryptographic Audit Ledger**: Each scraped JSON payload is hashed with SHA-256 and committed to a PostgreSQL TimescaleDB audit ledger to ensure integrity for MoSPI statistical validation.

---

## 👥 Smart India Hackathon (SIH) Team
- **Project Title:** Development of a Real-time Airfare Price Index for India
- **Focus Area:** High-Frequency Price Statistics, CPI Modernization, Machine Learning Nowcasting
- **Authority:** Ministry of Statistics and Programme Implementation (MoSPI)

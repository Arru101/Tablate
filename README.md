# Tablate — Real-Time Emergency Medicine Discovery Platform for India

**Tablate** is an enterprise-grade, real-time medicine availability discovery platform tailored for India. It helps users instantly locate nearby licensed brick-and-mortar pharmacies that have a required medicine in stock before they travel.

> **CRITICAL REGULATORY COMPLIANCE**: Tablate does **NOT** function as an online pharmacy or medicine delivery app. It operates purely as a discovery & live radar platform. Users physically visit the pharmacy to purchase medicines. Fully compliant with the Indian **Drugs and Cosmetics Act 1940**, **Drug Rules 1945**, and **Pharmacy Act 1948**.

---

## 🌟 Key Product Features

### 1. Patient Discovery Portal
- **Smart AI Search**: Search by Brand name (Dolo 650, Augmentin 625 Duo, Pantocid 40), Generic Molecule, or Category. Supports fuzzy matching & misspellings.
- **AI Strip & Prescription OCR**: Upload photo of medicine strip or prescription for computer vision extraction.
- **Voice & Barcode Search**: Web Speech API Indian English & Hindi voice search + camera barcode scanner simulation.
- **Interactive OpenStreetMap Radar**: Leaflet map displaying nearby verified pharmacies with 3km → 5km → 10km → 15km dynamic search radius expanders.
- **Stock Status**: Verified units, price (MRP), ETA travel time, open status, 24x7 night emergency indicator, direct store calling, and Google Maps navigation.
- **Pharmacist Recommended Alternatives**: Identical active generic molecule substitutes (e.g., Calpol 650 / Pacimol 650 for Dolo 650).
- **Multi-Language Support**: 8 Indian languages (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada).

### 2. Pharmacist Operations Portal
- **5-Step KYC Verification**: Drug License # (Form 20B/21B), Owner Aadhaar Verification, Store Front Photo, GPS Geotag validation, Live Selfie & 15-second Video verification.
- **Live WebSocket Radar**: Real-time audio/visual emergency pings when nearby patients search for medicines, with 1-tap "Confirm Available" or "Mark Unavailable".
- **Store Inventory Manager**: Bulk CSV/JSON upload parser, real-time stock levels, expiry date warnings within 30 days.

### 3. Enterprise Admin Command Center
- **KYC Audit Desk**: Document inspector for state drug license certificates, Aadhaar IDs, and live selfie videos.
- **Geospatial Shortage Heatmap**: Recharts visualizer for tracking regional medicine demand spikes across Indian cities.
- **Master Medicine Catalog**: Master drug database manager for Schedule H/H1 Rx flags, generic mappings, and price limits.
- **Security Center**: Immutable audit logs, OWASP rate limiter monitoring, and bot trigger alerts.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ or v22+
- npm v9+

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# App will launch at http://localhost:3000
```

### Building for Production

```bash
npm run build
```

---

## 🏗 Tech Stack Architecture

- **Frontend**: Next.js 14 / React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet OpenStreetMap, Zustand, Recharts.
- **Backend API & WebSockets**: NestJS, Socket.IO, REST & GraphQL.
- **Database & Spatial Engine**: PostgreSQL + PostGIS, Prisma ORM, Redis Cache.
- **Security & Compliance**: OWASP Top 10, JWT Refresh Tokens, RBAC Authorization, Rate Limiting.

# CrimePulse AI — Karnataka SCRB Intelligence Platform

CrimePulse AI is an advanced, command-intelligence grade crime analytics and public safety dashboard custom-built for the **Karnataka State Crime Records Bureau (SCRB)**. Modeled after modern tactical law enforcement control rooms, the platform balances dense analytical tables with real-time geographic insights, predictive patrol routing, OCR-driven FIR analysis, and role-based operational modules.

---

## 🏗️ System Architecture

The project is structured as a full-stack monorepo:

*   **`apps/web/`**: Vite + React + TypeScript dashboard. Governs interactive charting, spatial analytics, Leaflet GIS mapping, dynamic settings, and role-based login interfaces.
*   **`apps/api/`**: Express + TypeScript backend. Handles spatial clustering calculations, anomaly detection algorithms, audit-logging, FIR document parsing, and database transactions.
*   **`apps/ml-service/`**: Python + FastAPI microservice. Powers statistical forecast models, spatial risk calculations, and semantic search interfaces.
*   **`data-store-schema/`**: Schema designs and Entity Relationship Diagrams (ERD) mapping the relational databases.
*   **`data/`**: Core synthetic database seeder scripts and CSV exports.

---

## 💡 How the Project Works (Technical Specifications)

This section explains the core data flows, processing pipelines, and technical logic behind each major module of the platform.

```
                  ┌────────────────────────────────────────┐
                  │          Vite + React Client           │
                  │  (GIS Leaflet Map, Charts, OCR Upload) │
                  └──────────────────┬─────────────────────┘
                                     │
                     HTTP Requests   │  JSON Payload
                     & File Uploads  ▼
                  ┌────────────────────────────────────────┐
                  │         Express API Server             │
                  │   (SQLite Controller, PDF Parser)       │
                  └──────┬───────────────────┬─────────────┘
                         │                   │
             SQL Queries │                   │ Fetch Forecasts
                         ▼                   ▼
                  ┌──────────────┐   ┌─────────────────────┐
                  │  SQLite DB   │   │ Python FastAPI ML   │
                  │  (Local/Tmp) │   │ (Risk Models, Stats)│
                  └──────────────┘   └─────────────────────┘
```

### 1. Spatial Analytics & GIS Hotspot Mapping
*   **Data Retrieval**: The React client queries the `/api/incidents` endpoint, passing active filter parameters (such as District, Police Station, Crime Type, and Date Range).
*   **Backend Aggregation**: The Express API queries the SQLite database, executing filtered SQL joins across reference lookup tables (`Unit`, `District`, `GravityOffence`, `CrimeSubHead`).
*   **Frontend GIS Rendering**: The filtered coordinates (Latitude and Longitude) are loaded into the **Leaflet map engine**. The client dynamically overlays **heatmaps** and **clustered markers** representing density-based crime zones across Karnataka.

### 2. Predictive Patrol Route Optimization
*   **Algorithm Goal**: Recommends highly efficient routes for Beat Constables patrolling high-risk zones.
*   **Spatial Grid Generation**: The backend analyzes incident locations and groups them into density grids.
*   **Route Calculation**: The patrol routing engine runs a pathfinding algorithm connecting the highest-density nodes. It draws polyline paths on the Leaflet map, guiding the Beat Constable through high-priority checkpoints.

### 3. FIR Document Ingestion, OCR & AI Classification
*   **File Upload**: The Station House Officer (SHO) uploads an FIR PDF document via the dashboard portal.
*   **OCR Parsing**: The Express backend parses the binary buffer of the uploaded file using `pdf-parse`, extracting the raw text structure.
*   **Text Classification**:
    *   The extracted text is processed by a text classifier.
    *   It extracts critical case metrics such as **Crime Category** (e.g., Theft, Assault), **Severity/Gravity** (Heinous vs. Non-Heinous), **Suspect Names**, and **Incident Timestamps**.
    *   The parsed FIR metadata is saved to the SQLite database and shown instantly in the dashboard logs.

### 4. Local Database & Persistent SQLite Architecture
*   **Standalone Database**: The app uses SQLite (`better-sqlite3` locally, with a `node:sqlite` fallback). This bypasses Zoho Catalyst ZCQL join limits (4 joins max), allowing full relational database processing.
*   **Production Portability**: Zoho AppSail runs in a read-only container. On container startup, the backend automatically copies the template SQLite database (`crimepulse.db`) to the writable `/tmp` directory. All active database updates (such as adding incidents or modifying credentials) read/write directly to `/tmp/crimepulse.db`.

### 5. Centralized Credentials Synchronization
*   **Role Context (`RoleProvider.tsx`)**: Exposes states for user authentication.
*   **Database Syncing**:
    *   When the Superintendent (SP) saves a new password under **Credentials Control**, a `POST /api/credentials` updates the central SQLite credentials table.
    *   When any computer or browser tab opens the login page, it makes a `GET /api/credentials` request to fetch the customized configurations, ensuring the new credentials sync instantly across all laptops.

---

## 🛠️ Local Setup & Execution Guide

Follow these steps to run the complete monorepo locally:

### 1. Prerequisites
*   **Node.js**: Version 18.x or 20.x installed.
*   **Python**: Version 3.10+ installed.
*   **Git**: Installed and configured.

### 2. Initial Setup
Clone the repository and install dependencies:
```bash
# Clone the repository
git clone https://github.com/vthirumalai882590-gif/CrimePlus_AI.git
cd CrimePlus_AI

# Install all monorepo dependencies
npm install
```

### 3. Initialize Python ML Service Virtual Environment
Navigate to the ML microservice directory to configure a virtual environment:
```bash
cd apps/ml-service

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
cd ../..
```

### 4. Run the Local Development Servers
To start the React frontend, Express API server, and FastAPI ML service concurrently, run:
```bash
npm run dev
```

*   **Vite Web App**: Runs at [http://localhost:5173/](http://localhost:5173/)
*   **Express API Server**: Runs at [http://localhost:5000/](http://localhost:5000/)
*   **FastAPI ML Microservice**: Runs at [http://localhost:8000/](http://localhost:8000/)

---

## # CrimePulse AI — Karnataka SCRB Intelligence Platform

CrimePulse AI is a command‑intelligence‑grade crime analytics and public‑safety dashboard built for the **Karnataka State Crime Records Bureau (SCRB)**. It is modeled after tactical law‑enforcement control‑room software (Palantir Gotham / ArcGIS Public Safety style), combining dense analytical tables, live GIS mapping, predictive patrol routing, OCR‑driven FIR (First Information Report) intelligence, and role‑based operational modules into a single full‑stack platform.

> ⚠️ **Demo / hackathon project.** All crime, offender, and victim data shipped with this repository is **synthetic**, generated for the SCRB Datathon. Nothing in this codebase represents real individuals or real case records.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Repository Layout](#2-repository-layout)
3. [Feature Modules](#3-feature-modules)
4. [Roles & Access Control](#4-roles--access-control)
5. [Backend API Reference](#5-backend-api-reference-expressts)
6. [ML Microservice Reference](#6-ml-microservice-reference-fastapipython)
7. [Data Model](#7-data-model)
8. [Design System](#8-design-system)
9. [Environment Variables](#9-environment-variables)
10. [Local Setup & Execution](#10-local-setup--execution)
11. [Data Seeding & Migration Utilities](#11-data-seeding--migration-utilities)
12. [Internationalization](#12-internationalization)
13. [Git / GitHub Workflow](#13-git--github-workflow)
14. [Zoho Catalyst Deployment](#14-zoho-catalyst-deployment)
15. [Known Limitations](#15-known-limitations)

---

## 1. System Architecture

The project is a full‑stack **monorepo** (npm workspaces) with three runtime services plus supporting schema/data assets:

```
                  ┌─────────────────────────────────────────┐
                  │         Vite + React + TS Client         │
                  │  (Leaflet GIS map, Recharts, OCR upload,  │
                  │   AI chat console, multi-step forms)      │
                  └──────────────────┬────────────────────────┘
                                     │ HTTP (JSON + multipart)
                                     ▼
                  ┌─────────────────────────────────────────┐
                  │           Express + TS API Server         │
                  │  (SQLite controller, PDF/OCR parsing,      │
                  │   audit logging, bulk import, Groq/Gemini  │
                  │   LLM proxy for chat + FIR summarization)  │
                  └──────┬───────────────────┬────────────────┘
                         │ SQL queries        │ Fetch forecasts
                         ▼                    ▼
                  ┌──────────────┐   ┌──────────────────────┐
                  │   SQLite DB   │   │  Python FastAPI ML    │
                  │ (local / /tmp)│   │ (scikit-learn risk /   │
                  │               │   │  correlation / search) │
                  └──────────────┘   └──────────────────────┘
```

* **`apps/web/`** — Vite + React 19 + TypeScript single‑page dashboard. Handles charting, spatial analytics, Leaflet GIS mapping, role‑based login, multi‑step record entry, and a conversational AI command center.
* **`apps/api/`** — Express + TypeScript backend. Owns the SQLite database, spatial clustering, anomaly detection, audit logging, FIR/PDF parsing, bulk CSV import, and LLM‑backed endpoints (chat assistant, FIR summarizer).
* **`apps/ml-service/`** — Python + FastAPI microservice. Serves socio‑economic correlation matrices, geo‑binned risk forecasts, and semantic similarity search over FIR text.
* **`data-store-schema/`** — Documentation of the relational schema (ERD‑aligned) intended for the Zoho Catalyst Data Store.
* **`data/`** — SQLite `schema.sql`, a synthetic‑data generator script, and a reference IPC crime‑statistics CSV.
* **`functions/`** — A Zoho Catalyst Advanced I/O serverless function (`ingestUpload`) for Stratus‑backed file intake.
* **`scripts/`** — One‑off Node scripts used to migrate/export the local SQLite data into Catalyst Data Store CSV/import‑config form.
* **`client/`** — A minimal placeholder static site (legacy/scratch Catalyst client stub, not the production dashboard).
* **`docs/`** — Internal build‑phase log and design‑system specification used to keep the UI visually consistent.

---

## 2. Repository Layout

```
CrimePlus_AI-main/
├── apps/
│   ├── web/                     # React + Vite + TS dashboard (production client)
│   │   ├── src/
│   │   │   ├── App.tsx          # Login screen + HashRouter root
│   │   │   ├── app/
│   │   │   │   ├── AppShell.tsx     # Sidebar/topbar shell, role-aware nav
│   │   │   │   ├── RoleProvider.tsx # Auth context: CONSTABLE / SHO / SP
│   │   │   │   └── routes.tsx       # All 13 dashboard views + route table
│   │   │   ├── store/            # Zustand stores (filters, drafts, UI prefs, i18n, cache)
│   │   │   ├── i18n/             # en.json / kn.json translation tables
│   │   │   └── styles/tokens.css # Design tokens (colors, spacing, radii)
│   │   └── package.json
│   ├── api/                     # Express + TS backend
│   │   ├── src/
│   │   │   ├── server.ts        # ~2,000-line route file (see API reference below)
│   │   │   └── db/
│   │   │       ├── connection.ts
│   │   │       └── seeder.ts
│   │   ├── crimepulse.db        # Local SQLite database file
│   │   └── package.json
│   └── ml-service/               # FastAPI microservice
│       ├── app/main.py           # 3 ML endpoints (see reference below)
│       ├── requirements.txt
│       └── crimepulse.db         # Read-only copy for ML queries
├── data/
│   ├── schema.sql                # Full relational schema (30+ tables)
│   ├── ipc_crime_statistics.csv  # Reference IPC statistics dataset
│   └── generator/generate_data.py# Synthetic data generator/seeder
├── data-store-schema/schema.md   # Catalyst Data Store ERD documentation
├── docs/
│   ├── build-phases.md           # Phase-by-phase build log (Phase 0 → 8)
│   └── design-system.md          # Color palette, typography, layout rules
├── functions/ingestUpload/       # Catalyst serverless upload-intake function
├── scripts/                      # Catalyst migration/export utilities
│   ├── export-to-csv.js
│   ├── migrate-to-catalyst.js
│   ├── run-import.js
│   ├── zip-api.js
│   └── csv-export/               # Generated CSV + import-config snapshots
├── client/                       # Minimal static placeholder client
├── catalyst.json                 # Catalyst project topology (client + 2 AppSail services)
├── app-config.json               # Catalyst AppSail config for ml-service
├── package.json                  # Root workspace scripts
└── sample_fir.pdf                # Sample FIR document for OCR testing
```

---

## 3. Feature Modules

The dashboard is organized into 13 role‑gated views (defined in `apps/web/src/app/routes.tsx`):

| Route | View | Purpose | Roles |
| :--- | :--- | :--- | :--- |
| `/` | **Situation Dashboard** | KPI cards (active alerts, districts online, units active, live feeds), live Leaflet hotspot map with Karnataka‑bounded pan/zoom, tactical alert feed, incident trend chart, top‑districts ranking, repeat‑offender watchlist, system audit feed | Constable, SHO, SP |
| `/hotspots` | **Spatiotemporal Hotspots** | ML‑driven geo‑binned risk forecast overlay on the live map plus a risk‑radar side panel | SHO, SP |
| `/drilldown` | **District Drilldown** | Breadcrumb navigation (State → District → Station), KPI rollups, sortable "Station Jurisdictional Density Index" table with clearance‑rate bars | SHO, SP |
| `/alerts` | **Tactical Alerts** | Weekly incident trend vs. a rolling‑mean ±2σ expected band (auto‑flagging spikes), plus an acknowledge‑able anomaly feed | Constable, SHO, SP |
| `/network` | **Associate Network Graph** | Force‑directed SVG graph of co‑accused links, BFS shortest‑path "pathfinder" between two suspects, node profile sheet | SP |
| `/offenders` | **Repeat Offenders** | Tactical offender table with predictive risk score, confidence tag, and an "Explain Score" driver‑attribution popover | SHO, SP |
| `/risk` | **Risk & Patterns** | Socio‑economic crime‑correlation heatmap, per‑district socio‑economic profiler, searchable official IPC crime‑statistics table | SP |
| `/fir-intel` | **FIR Document Intelligence Suite** | Four sub‑tabs: *Specimen Comparison* (cross‑case MO matching with radar chart), *Rap Sheet Reconstruction* (name‑based identity resolution + CCTNS‑style timeline), *Semantic MO Search*, and *AI Smart FIR Summarizer* (PDF upload or pasted text → LLM‑structured field extraction) | SHO, SP |
| `/festival` | **Festival Forecast** | Event‑aware calendar of festivals/crowd events with crime‑risk multipliers and mandatory‑reallocation flags | SP |
| `/patrol` | **Patrol Allocation Optimizer** | Live map of patrol units, one‑click route‑optimization proposal (SP‑only), commit/cancel workflow with audit logging | SHO, SP |
| `/audit` | **Audit / Accountability Log** | Immutable operator action log (who did what, when) | SP |
| `/add-record` | **Add Record** | Multi‑step form for new criminal or victim records with manual entry, CSV bulk import, PDF→AI extraction, and database‑seeding utilities | SHO, SP |
| `/ai-command` | **AI Command Center** | Conversational assistant (Groq/Gemini‑backed) for natural‑language crime‑trend queries | Constable, SHO, SP |
| `/ingestion` | **Ingestion Command Center** | Multi‑station record‑ingestion pipeline simulator: drag‑and‑drop upload, format auto‑detection (clean CSV / messy CSV / scanned image), column‑mapping reconciliation, validation, and sync‑to‑datastore stepper, plus a statewide station‑ingestion‑status table | SHO, SP |

### Cross‑cutting technical flows

* **Spatial Analytics & GIS Hotspot Mapping** — The client queries `/api/incidents` with active filters (district, station, crime type, date range); the API runs filtered SQL joins across lookup tables (`Unit`, `District`, `GravityOffence`, `CrimeSubHead`); the client renders results as Leaflet markers/heatmap clusters bounded to Karnataka's geographic envelope.
* **Predictive Patrol Route Optimization** — Incident locations are grouped into density grids; a pathfinding pass connects the highest‑density nodes into a proposed patrol route rendered as a polyline.
* **FIR Ingestion, OCR & AI Classification** — An uploaded FIR PDF is parsed server‑side with `pdf-parse`; the extracted text is passed to an LLM (Groq primary, Gemini fallback) which returns structured fields (crime category, severity, suspect name, MO tags, timestamps) that are written back into the SQLite store and reflected instantly in the dashboard.
* **Local SQLite Architecture** — The app uses SQLite (`better-sqlite3` locally, `node:sqlite` fallback) instead of Zoho Catalyst's ZCQL (which caps joins at 4) so the relational schema can be queried freely. In production, Zoho AppSail runs a read‑only container; on startup the backend copies the template database to `/tmp/crimepulse.db`, and all writes go there.
* **Centralized Credentials Sync** — `RoleProvider.tsx` exposes auth state; when an SP updates a role's password via **Credentials Control**, `POST /api/credentials` writes to a shared table, and every browser/tab reads the latest values via `GET /api/credentials` so logins stay in sync across machines.

---

## 4. Roles & Access Control

Three roles are modeled client‑side via `RoleProvider.tsx` and gate navigation entries per the route table above:

| Role | Description | Default login |
| :--- | :--- | :--- |
| `CONSTABLE` | Field‑level access: dashboard, alerts, AI command center only | `constable.ksp` / `ksp123` (demo default) |
| `SHO` | Station House Officer: adds ingestion, FIR intelligence, offenders, patrol, and record‑entry access | `sho.ksp` / `ksp123` (demo default) |
| `SP` | Superintendent of Police: full access including network graph, risk models, festival forecasting, audit logs, and patrol‑route commit authority | `sp.ksp` / `ksp123` (demo default) |

Credentials are stored/synced through the `/api/credentials` endpoint and can be changed at runtime from the SP's Credentials Control panel — there is no separate identity provider; this is a self‑contained demo auth layer, **not** production‑grade authentication.

---

## 5. Backend API Reference (Express/TS)

Base path: `/api` (served at `http://localhost:5000/api` locally). All endpoints are implemented in `apps/api/src/server.ts`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/incidents` | Filtered incident list (district, station, dateRange, severity) |
| POST | `/incidents` | Create a new incident record |
| GET | `/hotspots` | Aggregated hotspot data |
| GET | `/anomalies` | Rolling anomaly/deviation alerts |
| POST | `/anomalies/acknowledge` | Mark an anomaly as acknowledged (records operator role) |
| GET | `/offenders` | Repeat‑offender list with risk scores |
| POST | `/offenders` | Register a new offender profile (with duplicate‑identity check) |
| POST | `/offenders/:id/crimes` | Append a crime‑history entry to an offender |
| POST | `/victims` | Register a new victim record |
| POST | `/bulk-import` | CSV bulk import for criminal or victim record sets |
| GET | `/patrols` | Current patrol‑unit positions/status |
| POST | `/patrols/allocate` | Commit an optimized patrol allocation (SP‑gated in the UI) |
| GET | `/audit-logs` | Accountability/audit trail |
| POST | `/audit-logs` | Append an audit entry |
| GET | `/festivals` | Festival/event forecast calendar |
| POST | `/uploaded-firs/upload` | Upload a raw FIR file (CSV/image/PDF) into the ingestion pipeline |
| POST | `/uploaded-firs/ingest-csv` | Ingest a mapped CSV file of FIR records |
| GET | `/uploaded-firs` | List staged FIR specimens (for cross‑case comparison) |
| POST | `/uploaded-firs` | Register a staged FIR specimen |
| POST | `/uploaded-firs/resolve-identity` | Fuzzy name‑match search for suspect identity resolution |
| GET | `/ml/socio-economic-correlation` | Proxies the ML service's correlation matrix |
| GET | `/ml/risk-forecast` | Proxies the ML service's geo‑binned risk forecast |
| POST | `/ml/similarity-search` | Proxies the ML service's FIR semantic similarity search |
| GET | `/ipc-statistics` | Official state‑wide IPC crime statistics table |
| POST | `/ai/fir-pdf-extract` | Extracts raw text from an uploaded FIR PDF (`pdf-parse`) |
| POST | `/ai/fir-summarize` | LLM‑powered structured field extraction from FIR text (Groq → Gemini fallback) |
| POST | `/ai/nl-query` | Natural‑language → data query helper |
| POST | `/ai/chat` | Conversational AI command‑center endpoint |
| GET | `/db/list-tables` | Lists tables in the active SQLite database |
| GET | `/db/seed` | Re‑runs the database seeder against the active (local/`/tmp`) database |
| GET | `/credentials` | Fetches the current role → username/password mapping |
| POST | `/credentials` | Updates a role's login credentials |

> The API auto‑detects its runtime target: `DB_MODE=catalyst` or the presence of `CATALYST_PROJECT_ID` switches certain paths to Catalyst‑aware behavior; otherwise it runs against the local SQLite file.

---

## 6. ML Microservice Reference (FastAPI/Python)

Base path: `/` (served at `http://localhost:8000` locally, implemented in `apps/ml-service/app/main.py`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Service root/info |
| GET | `/health` | Health check |
| GET | `/api/ml/socio-economic-correlation` | Returns a categories × categories correlation matrix (unemployment, illumination, alcohol density, dropout rate, etc. vs. crime types) |
| GET | `/api/ml/risk-forecast` | Returns geo‑binned risk forecasts (grid ID, risk score 0–1, dominant contributing factor), optionally filtered by `district` |
| POST | `/api/ml/similarity-search` | Accepts a free‑text query + `limit`, returns semantically similar historical incidents with match scores |

Dependencies are intentionally minimal (`fastapi`, `uvicorn`); statistical/ML logic (scikit‑learn‑style correlation and forecasting) is computed in‑process against the shared SQLite dataset.

---

## 7. Data Model

The canonical relational schema lives in `data/schema.sql` (SQLite DDL, ~30 tables) with a parallel ERD‑style description in `data-store-schema/schema.md` intended for Zoho Catalyst's Data Store. It is organized into:

* **Reference/lookup tables** — `State`, `District` (with socio‑economic indices), `UnitType`, `Unit` (police stations, with lat/long), `Rank`, `Designation`, `CaseCategory`, `GravityOffence`, `CaseStatusMaster`, `CasteMaster`, `ReligionMaster`, `OccupationMaster`, `Court`, `Employee`, `Act`, `Section`, `CrimeHead`, `CrimeSubHead`, `CrimeHeadActSection`.
* **Case/record tables** — `CaseMaster`, `ComplainantDetails`, `ActSectionAssociation`, `Victim`, `Accused`, `ArrestSurrender`, `ChargesheetDetails`.
* **Application‑layer tables** (used directly by the dashboard views) — `incidents`, `offenders`, `victims`, `audit_log`/`audit_logs`, `uploaded_firs`, `anomalies`, `festivals`, `patrols`, `station_column_mappings`, `upload_batches`.

Synthetic data is generated via `data/generator/generate_data.py`, which seeds the local SQLite file at `apps/api/crimepulse.db` (or `/tmp/crimepulse.db` in the AppSail production container).

---

## 8. Design System

The full specification lives in `docs/design-system.md`. Highlights:

* **Visual philosophy**: command‑intelligence tool aesthetics (à la Palantir Gotham / ArcGIS Public Safety / Bloomberg Terminal) — maximum information density, no glassmorphism, no decorative gradients; color is always functional (status/alert/heat tiers only).
* **Palette** (CSS variables in `apps/web/src/styles/tokens.css`): `--bg-base` (`#070B19`), `--bg-surface` (`#0E1626`), `--text-primary` (`#F8FAFC`), `--color-accent` (`#38BDF8`), plus severity tiers `--severity-low` (emerald `#10B981`), `--severity-medium` (amber `#F59E0B`), `--severity-high` (crimson `#EF4444`).
* **Typography**: system sans‑serif stack for UI text; a monospace numeric font for all counters, IDs, and tabular figures.

---

## 9. Environment Variables

Create a `.env` file at the repository root (the API loads `.env` from several candidate paths automatically):

| Variable | Required | Used by | Purpose |
| :--- | :--- | :--- | :--- |
| `GROQ_API_KEY` | One of Groq/Gemini required for AI features | `apps/api` | Primary LLM provider for FIR summarization and the AI chat assistant |
| `GEMINI_API_KEY` | One of Groq/Gemini required for AI features | `apps/api` | Fallback LLM provider if Groq is unavailable |
| `PORT` | No (defaults to `5000`) | `apps/api` | Express server port |
| `ML_SERVICE_URL` | No (defaults to `http://127.0.0.1:8000`) | `apps/api` | Where the API proxies ML requests to |
| `DB_MODE` | No | `apps/api` | Set to `catalyst` to force Catalyst‑aware database behavior |
| `CATALYST_PROJECT_ID` | Injected by Zoho Catalyst runtime | `apps/api` | Auto‑detected to switch to production/Catalyst mode |
| `X_ZOHO_CATALYST_ENV_ID` | Injected by Zoho Catalyst runtime | `apps/api` | Catalyst environment identifier used to build the deployed API base URL fallback |
| `X_ZOHO_CATALYST_LISTEN_PORT` | Injected by Zoho Catalyst runtime | `apps/api` | Overrides `PORT` in the AppSail container |

Without an LLM key set, the AI Smart Summarizer and AI Command Center endpoints will report that no LLM key is configured; the rest of the dashboard functions normally against the seeded SQLite data.

---

## 10. Local Setup & Execution

### Prerequisites
* **Node.js** 18.x or 20.x
* **Python** 3.10+
* **Git**

### 1. Clone & install
```bash
git clone https://github.com/vthirumalai882590-gif/CrimePlus_AI.git
cd CrimePlus_AI
npm install
```

### 2. Set up the Python ML service virtual environment
```bash
cd apps/ml-service
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
cd ../..
```

### 3. (Optional) Configure LLM keys
```bash
echo "GROQ_API_KEY=your_key_here" >> .env
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### 4. Run all three services concurrently
```bash
npm run dev
```

| Service | URL |
| :--- | :--- |
| Vite web app | http://localhost:5173/ |
| Express API server | http://localhost:5000/ |
| FastAPI ML microservice | http://localhost:8000/ |

Individual services can also be run in isolation:
```bash
npm run web:dev   # Vite dev server only
npm run api:dev    # Express API only (nodemon)
npm run ml:dev      # FastAPI service only
```

### 5. First login
Use one of the demo credential sets (see [Roles & Access Control](#4-roles--access-control)) on the login screen; the SP role has full navigation access.

---

## 11. Data Seeding & Migration Utilities

* **`data/generator/generate_data.py`** — Rebuilds `apps/api/crimepulse.db` from `data/schema.sql`, populating all reference tables plus synthetic incidents, offenders, victims, patrols, festivals, and anomalies.
* **`GET /api/db/seed`** — Triggers the same seeding logic against whichever database file the running API instance is using (local file or `/tmp/crimepulse.db` in production), exposed in the dashboard's **Add Record → Bulk Upload → Database Seeding** tab.
* **`scripts/export-to-csv.js`** — Exports the local SQLite tables (`anomalies`, `festivals`, `patrols`, `offenders`, `incidents`) to CSV snapshots in `scripts/csv-export/`.
* **`scripts/run-import.js`** — Generates Catalyst `ds:import` config JSON files and imports the exported CSVs into a Catalyst Data Store bucket non‑interactively.
* **`scripts/migrate-to-catalyst.js`** / **`scripts/zip-api.js`** — Additional helpers for packaging/migrating the API for Catalyst deployment.
* **`functions/ingestUpload/`** — A Catalyst Advanced I/O function that receives a station's file upload, stores it in Catalyst Stratus (organized by station/date for provenance), and logs an `upload_batches` row.

---

## 12. Internationalization

The dashboard ships with English and Kannada translation tables (`apps/web/src/i18n/en.json`, `kn.json`), managed through a Zustand `languageStore` and a `useLocalTranslation()` hook used throughout the views (e.g., confidence tags, driver‑attribution labels, audit‑log column headers).

---

## 13. Git / GitHub Workflow

```
  Laptop A (Dev)  --->  git commit & push  --->  GitHub (main branch)
  Laptop B (Team) --->  git pull           <---  GitHub (main branch)
```

**Set Git identity locally (if prompted):**
```bash
git config user.name "vthirumalai882590-gif"
git config user.email "vthirumalai882590@gmail.com"
```

**Save and push changes:**
```bash
git add .
git commit -m "feat: updated settings style and credentials sync"
git push origin main
```

**Pull teammates' updates:**
```bash
git pull origin main
```

---

## 14. Zoho Catalyst Deployment

The topology in `catalyst.json` deploys one static client and two AppSail (containerized) services:

| Component | Catalyst name | Source |
| :--- | :--- | :--- |
| Static client | `crimepulse-web` | `apps/web/dist` |
| API AppSail | `crimepulse-api` | `apps/api` |
| ML AppSail | `CrimePulse-ml` | `apps/ml-service` |

### 1. Build the production client
```bash
npm run web:build
```
Generates minified build output in `apps/web/dist`.

### 2. Deploy
```bash
catalyst login
catalyst deploy
```
Catalyst will output the live endpoint, e.g. `https://crimeplus-60077655392.development.catalystserverless.in/app/index.html`.

### Production database behavior
Zoho AppSail runs a **read‑only** container. On startup, the API copies the bundled template SQLite database (`crimepulse.db`) to the writable `/tmp` directory; all subsequent reads/writes target `/tmp/crimepulse.db`, so data persists only for the container's lifetime (until the next redeploy/restart).

---

## 15. Known Limitations

* All shipped data is **synthetic**; there is no connection to any real CCTNS/SCRB production system.
* The demo authentication layer (`RoleProvider.tsx` + `/api/credentials`) is a lightweight, self‑contained mechanism for the hackathon — it is **not** a substitute for a real identity/authorization system in production.
* Because Zoho AppSail containers are read‑only outside `/tmp`, data written in production does not persist across redeploys/restarts unless externalized to a durable store.
* Several "AI" features (FIR summarization, chat assistant) require a configured `GROQ_API_KEY` or `GEMINI_API_KEY`; without one, those specific endpoints degrade gracefully but remain non‑functional.
* The `client/` directory is a minimal legacy/placeholder static page and is unrelated to the production dashboard in `apps/web/`.

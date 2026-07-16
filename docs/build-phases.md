# CrimePulse AI — Build Phases

This file records the progression of development phases to keep code changes organized, modular, and easy to debug.

---

## Phase 0: Repo Scaffold, Design Tokens, & App Shell
- Initialize React + Vite + TS (frontend), Express + TS (backend), FastAPI (Python ML service).
- Add design tokens (`tokens.css`, `index.css`).
- Build core UI components: `AppShell.tsx`, `RoleProvider.tsx` (Constable/SHO/SP context), `filterStore.ts`, English & Kannada translation tables.

## Phase 1: Synthetic Data Generation & SQLite Database Setup
- Python scripts in `data/generator/` to produce crime logs, resource arrays, and local event calendars.
- SQLite database schema definition (`schema.sql`) and database initialization.
- Seed script to load synthetic tables into `apps/api/src/db/crimepulse.db`.

## Phase 2: Core Backend API
- Filtered query routers for incidents, hotspots, and anomalies.
- Wire API routes directly to the seeded SQLite database.

## Phase 3: Dashboard & Mapping Modules (4.1 – 4.3)
- Left sidebar and main dashboards.
- District drill-down maps (Choropleth/Leaflet) and Hotspot heatmap views.
- Top-10 density analytics.

## Phase 4: Active Tactical Alerts & Network Graphs (4.4 – 4.6)
- Anomaly rolling deviation feeds.
- D3 network node-link force graphs for repeat offender mapping and modus operandi similarity clusters.

## Phase 5: Risk & Pattern Models (4.7)
- Integration of `ml-service` to output socio-economic correlation matrices and geo-binned risk forecasts.

## Phase 6: Core Differentiators (5.1 – 5.3)
- Similarity search on FIR content.
- Event-aware festival calendar overlay forecasts.
- Resource allocation/patrol optimization algorithms.

## Phase 7: Explainability Rollout & Audit Log (7.0)
- Expandable `ExplainBadge` and `ConfidenceTag` components explaining automated scores.
- Interactive accountability log tracking constable and SHO allocations.

## Phase 8: Internationalization & QA
- Kannada translations and demo scripts.

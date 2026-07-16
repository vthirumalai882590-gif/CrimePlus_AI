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

## 🐙 Git/GitHub Team Workflow

This repository uses Git for version control and GitHub as the host:

```
  Laptop A (Dev)  --->  git commit & push  --->  GitHub (main branch)
  Laptop B (Team) --->  git pull           <---  GitHub (main branch)
```

### 1. Setting Git Identity (If Prompted)
If you get an "Author identity unknown" error, configure Git with your details locally inside the folder:
```bash
git config user.name "vthirumalai882590-gif"
git config user.email "vthirumalai882590@gmail.com"
```

### 2. Saving and Pushing Your Changes
When you have made modifications on your machine and want to save them to GitHub:
```bash
# Stage all modified and new files
git add .

# Commit changes with a summary message
git commit -m "feat: updated settings style and credentials sync"

# Push to your GitHub repository
git push origin main
```

### 3. Fetching Updates on Other Laptops
To pull down the latest changes that your teammate pushed to GitHub:
```bash
git pull origin main
```

---

## ☁️ Zoho Catalyst Production Deployment

To compile the latest build and deploy the entire solution live to the Zoho Catalyst Serverless Cloud:

### 1. Compile the Static React Client
Generate minified production build files in `apps/web/dist`:
```bash
npm run web:build
```

### 2. Run Catalyst Deployment
```bash
# Log in to your Catalyst Account (if not already logged in)
catalyst login

# Deploy all static pages, AppSail APIs, and functions live
catalyst deploy
```

Once completed, Catalyst will output your live URL endpoint (e.g. `https://crimeplus-60077655392.development.catalystserverless.in/app/index.html`).

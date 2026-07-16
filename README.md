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

## 💡 How the Program Works

### 1. The Frontend Dashboard
*   **Role & Authentication (`RoleProvider.tsx`)**: Controls access levels for Beat Constables, SHOs, and the SP. On startup, it synchronizes login credentials with the central SQLite database.
*   **Tactical Analytics & Map View (`AppShell.tsx` / Leaflet)**: Displays active incident records, hotspot densities, and AI patrol routes. Swaps between high-density Dark Mode and high-legibility Light Mode.
*   **FIR Upload & OCR Parsing**: Accepts FIR PDF documents, extracts the textual content via `pdf-parse`, and runs LLM models to auto-categorize gravity, category, and suspects.

### 2. The Backend API Server
*   **SQLite Database (`db/connection.ts`)**: Maintains local records. Copies the database file to `/tmp` in production to ensure write access under Zoho Catalyst containers.
*   **Express Router (`server.ts`)**: Serves data points for incident tables, handles security logins, and proxies forecast queries to the Python microservice.

### 3. The ML Microservice
*   **FastAPI endpoints**: Computes socio-economic crime correlations and processes spatial risk forecasts.

---

## 🔒 Credentials Synchronization & Multi-Laptop Demos

To enable seamless collaborative presentations across different laptops or browsers, credentials are synchronized dynamically:

1. **Local State & Storage**: When the SP alters credentials under Settings, the changes are stored locally in the browser's `localStorage` for instant responsiveness.
2. **Centralized Database Write**: Simultaneously, a `POST /api/credentials` request is made to save the updated ID and passcode to the SQLite database.
3. **Multi-Device Fetch**: When any other laptop loads the web application, the `RoleProvider` queries `GET /api/credentials` to automatically fetch the updated login parameters. This ensures that custom credentials are synchronized universally.

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

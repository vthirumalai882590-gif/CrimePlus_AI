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

## 🔒 Multi-Role Access & Credentials Synchronization

The platform utilizes a structured access hierarchy representing active roles within the Karnataka police force:

| Role Identity | Default Badge ID | Default Passphrase | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Superintendent of Police (SP)** | `sp.ksp` | `ksp123` | Full administrative settings, credentials configuration for all roles, state-wide spatial metrics, ML risk indicators. |
| **Station House Officer (SHO)** | `sho.ksp` | `ksp123` | Station-level filter sets, patrol dispatch planning, FIR uploads, and local audit logs. |
| **Beat Constable** | `constable.ksp` | `ksp123` | Route navigation, crime incident forms, and beat assignment checklists. |

### Centralized SQLite Credentials Synchronization
To enable multi-laptop and multi-device collaborative demonstrations, the platform synchronizes customized login credentials using a shared SQLite database:
1. When the SP edits any login credentials inside the **Credentials Control (Slide 2)** settings tab, changes are instantly written to the backend API (`POST /api/credentials`).
2. When the application loads on any laptop or browser, the frontend context (`RoleProvider`) fetches the latest active configuration from the database (`GET /api/credentials`), automatically updating the login buttons and validation logic in real-time.

---

## 🛠️ Local Setup & Execution Guide

Follow these steps to run the complete monorepo on your local machine:

### 1. Prerequisites
*   **Node.js**: Version 18.x or 20.x installed.
*   **Python**: Version 3.10+ installed.
*   **Git**: For code management.

### 2. Initial Setup
Clone the repository and install the parent monorepo packages:
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
To start the React frontend, Express API server, and FastAPI ML service concurrently, run the following command from the root workspace directory:
```bash
npm run dev
```

*   **Vite Web App**: Runs at [http://localhost:5173/](http://localhost:5173/)
*   **Express API Server**: Runs at [http://localhost:5000/](http://localhost:5000/)
*   **FastAPI ML Microservice**: Runs at [http://localhost:8000/](http://localhost:8000/)

---

## ☁️ Zoho Catalyst Platform Deployment

The platform is configured to deploy directly to the Zoho Catalyst Serverless platform.

### 1. Compile the Static React Client
Run the Vite build command to generate minified build bundles in `apps/web/dist`:
```bash
npm run web:build
```

### 2. Log in and Deploy
Ensure you have the Catalyst CLI installed globally (`npm install -g zcatalyst-cli`), then execute:
```bash
# Log in to your Zoho Catalyst Console
catalyst login

# Deploy all functions, AppSail endpoints, and web clients to the cloud
catalyst deploy
```

Once deployment completes, the CLI will output your live URL endpoint (e.g. `https://crimeplus-60077655392.development.catalystserverless.in/app/index.html`).

---

## 🎨 Design & Aesthetic System

*   **Dark Mode (Default)**: High-density tactical layout featuring subtle glows, glassmorphism panel backdrops, and deep contrast structures for 24/7 public safety control room monitoring.
*   **Light Mode**: A clean, accessible light gray interface designed for high daylight legibility, utilizing high-contrast blue interactive elements and clean slate boundaries. 
*   **Responsive Control Panel**: The system settings modal, located next to the **SYSTEM ONLINE** status badge in the sidebar header, includes tabbed configuration slides to govern API URLs, interfaces, and credential lists easily.

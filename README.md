# CrimePulse AI

CrimePulse AI is an advanced, command-intelligence grade crime analytics platform designed for the Karnataka State Crime Records Bureau (SCRB). It is modeled after tactical public safety control rooms, prioritizing density, data clarity, and high-frequency analytical queries.

## Monorepo Architecture

*   **`apps/web/`**: Vite + React + TypeScript frontend dashboard.
*   **`apps/api/`**: Node.js + Express + TypeScript backend. Handles SQL queries and seeds database resources.
*   **`apps/ml-service/`**: Python + FastAPI microservice. Houses statistical processing models (hotspot clustering, text search, predictive resource routing).
*   **`packages/shared-types/`**: Shared TypeScript types for full-stack API data-binding.
*   **`data/`**: Core synthetic data generation engines and SQLite seeding configurations.
*   **`docs/`**: Developer design system guidelines and modular phase schedules.

## Running Locally

To start the platform in a local development environment, follow the steps documented in each respective service subfolder, or start them via the global workspace scripts:
```bash
# Install root monorepo dependencies
npm install

# Start local Node API, React Vite app, and Python ML service
npm run dev
```

## Mock Authentication Logins

To access and test different role-based views on the dashboard:

| Role Identity | Badge ID / Username | Passcode |
| :--- | :--- | :--- |
| **Superintendent (SP)** | `sp.ksp` | `ksp123` |
| **Station House Officer (SHO)** | `sho.ksp` | `ksp123` |
| **Beat Constable** | `constable.ksp` | `ksp123` |

---

## Zoho Catalyst Platform Deployment

For submission, you must deploy the application on Zoho Catalyst:

1. **Install Catalyst CLI globally**:
   ```bash
   npm install -g zcatalyst-cli
   ```
2. **Log in to Catalyst**:
   ```bash
   catalyst login
   ```
3. **Build the static frontend client**:
   ```bash
   npm run web:build
   ```
4. **Initialize and Deploy**:
   ```bash
   catalyst init
   # select Client, choose apps/web/dist folder, then deploy:
   catalyst deploy
   ```

For detailed serverless database persistence planning and advanced backend container mappings, read the [Zoho Catalyst Deployment Guide](file:///C:/Users/WELCOME/.gemini/antigravity-ide/brain/c5e45656-dfbc-443d-9519-668f00bc043c/catalyst_deployment.md) in the project workspace.
"# CrimePlus_AI" 

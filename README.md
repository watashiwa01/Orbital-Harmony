# Orbital Harmony Sync — Divided Workspace

![Orbital Harmony Cover](./presentation/presentation_cover.png)

This project contains both the frontend interface and the backend autonomous operations simulation for the **Orbital Harmony** system.

## Workspace Structure

The project has been divided into clean, specialized folders:

```
├── frontend/           # React, Vite, and TanStack Start frontend app
├── backend/            # Python CLI orbital simulation optimization loop
└── presentation/       # Presentation deck images, diagrams, and HTML manuals
```

---

## 🖥️ Frontend (Vite / React / TanStack Start)

The frontend contains the interactive 3D Orbital Globe, live telemetry HUDs, and the Mission Control interface.

![Interactive 3D Globe](./presentation/globe_dots_telemetry.png)

### Running Frontend Locally

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (using Bun or npm):
   ```bash
   bun install
   # or
   npm install
   ```
3. Run the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```
4. Open the displayed URL (typically `http://localhost:3000`) in your browser.

---

## 🐍 Backend (Python CLI Simulation)

The backend runs the orbital propagation, collision/interference forecasting engine, and priority scheduling optimization.

![Conjunction Diagram](./presentation/conjunction_diagram.png)

### Running Backend Locally

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Run the main simulation loop (requires Python 3.10+):
   ```bash
   python main.py
   ```

No external pip dependencies are required. The simulation is fully self-contained.

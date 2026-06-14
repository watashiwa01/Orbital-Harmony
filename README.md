# Orbital Harmony

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

## ⚙️ System Procedure & Operational Workflow

Orbital Harmony protects astronomical observations from satellite constellation interference through an automated, four-step scheduling optimization pipeline:

1. **Observation Queue Ingestion**: 
   The system loads telescope schedules containing coordinates (Right Ascension/Declination) and priority tiers (e.g., Tier 3 for irreplaceable planetary defense vs. Tier 1 for low-priority transits).
2. **Real-time Satellite Propagation**:
   Ingests active two-line element (TLE) catalog data and utilizes Keplerian orbital mechanics (approximating altitude via Kepler's Third Law) to compute precise coordinates relative to the observatories.
3. **Conjunction Assessment & Intersection Check**:
   Calculates telescope field-of-view (FOV) cones. If a satellite's vector intersects a telescope's 1.5° pointing cone while the satellite is above the horizon (>10° elevation), it flags a conflict and computes a collision probability.
4. **Priority-Based Schedule Shift**:
   If conflict probability exceeds tolerance, the optimization engine evaluates alternate time slots. It shifts the observation window (typically 5 to 20 minutes) to resolve the conflict without displacing higher-tier observations, preserving scientific data.

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

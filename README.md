# Orbital Harmony Sync — Divided Workspace

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

---

## 🤝 Git Contribution & Pushing Guidelines

To meet the team target of **60 commits** divided equally between **30 commits for frontend** and **30 commits for backend**:

### User Accounts
- **Frontend Contributions (Leader)**: `amg-xai`
- **Backend & Workspace Contributions (User)**: `watashiwa01`

### How to Assign Commits Correctly

GitHub attributes commits to accounts based on the **author email**. Ensure you configure the appropriate email for each commit.

#### Option A: Use the `--author` Flag on Each Commit (Recommended)
You can commit under any username and email without changing your global git configuration:

*   **For Frontend Commits (`amg-xai`):**
    ```bash
    git add frontend/
    git commit --author="amg-xai <ajitamani.gupta25@gmail.com>" -m "feat: implement frontend widgets"
    ```
*   **For Backend/Workspace Commits (`watashiwa01`):**
    ```bash
    git add backend/
    git commit --author="watashiwa01 <varunsolanki9786@gmail.com>" -m "feat: optimize simulation scheduler"
    ```

#### Option B: Change Local Git Settings in Your Terminal Session
You can set local config before a commit batch:

*   **To commit as `amg-xai`:**
    ```bash
    git config user.name "amg-xai"
    git config user.email "ajitamani.gupta25@gmail.com"
    ```
*   **To commit as `watashiwa01`:**
    ```bash
    git config user.name "watashiwa01"
    git config user.email "varunsolanki9786@gmail.com"
    ```

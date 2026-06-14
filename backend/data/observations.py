# data/observations.py
# Queue of observations scheduled for simulated observatories

from models import Observation

ACTIVE_QUEUE = [
    Observation(
        id="t1",
        name="2024 PT5 — Near-Earth Asteroid",
        observatory_id="hanle",
        ra_deg=142.3,
        dec_deg=18.2,
        tier=3,
        category="Planetary Defense",
        start_min=5,
        duration_min=22,
        description="Astrometric follow-up of recently discovered NEO. Impact risk assessment.",
    ),
    Observation(
        id="t2",
        name="SN 2026aap — Type Ia Supernova",
        observatory_id="devasthal",
        ra_deg=201.4,
        dec_deg=-12.7,
        tier=2,
        category="Supernova Follow-up",
        start_min=18,
        duration_min=35,
        description="Spectroscopic time-series of rare Type Ia precursor. Light curve critical.",
    ),
    Observation(
        id="t3",
        name="TOI-2406 b — Exoplanet Transit",
        observatory_id="devasthal",
        ra_deg=65.8,
        dec_deg=-6.4,
        tier=1,
        category="Exoplanet Transit",
        start_min=40,
        duration_min=95,
        description="Atmospheric characterization via transmission spectroscopy.",
    ),
    Observation(
        id="t4",
        name="VVV Survey — Galactic Bulge",
        observatory_id="hanle",
        ra_deg=270.0,
        dec_deg=-29.0,
        tier=0,
        category="Routine Survey",
        start_min=0,
        duration_min=240,
        description="Variable star catalog photometry. Reschedulable.",
    ),
    Observation(
        id="t5",
        name="GRB 260613A — Afterglow",
        observatory_id="hanle",
        ra_deg=89.1,
        dec_deg=41.2,
        tier=3,
        category="Planetary Defense",
        start_min=75,
        duration_min=30,
        description="Gamma-ray burst optical counterpart. Fading rapidly.",
    ),
]

def load_observations() -> list[Observation]:
    return ACTIVE_QUEUE

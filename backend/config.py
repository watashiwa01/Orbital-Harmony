# config.py
# Constants and observatory configuration settings for Orbital Harmony

EARTH_RADIUS_KM = 6371.0
MU = 398600.4418  # km^3/s^2 standard gravitational parameter

# Priority Tiers
TIER_3 = 3  # Irreplaceable (Planetary Defense, NEO Tracking, Rare Transients)
TIER_2 = 2  # High Value (Supernova precursors, Fast transients)
TIER_1 = 1  # Time-Critical (Exoplanet transit windows)
TIER_0 = 0  # Routine (Routine sky surveys)

TIERS = {
    TIER_3: "TIER 3 — IRREPLACEABLE",
    TIER_2: "TIER 2 — HIGH VALUE",
    TIER_1: "TIER 1 — TIME-CRITICAL",
    TIER_0: "TIER 0 — ROUTINE",
}

# Observatory Configuration
OBSERVATORIES = {
    "hanle": {
        "name": "Indian Astronomical Observatory, Hanle",
        "code": "IAO-HNL",
        "latitude_deg": 32.7794,
        "longitude_deg": 78.9642,
        "elevation_m": 4500.0,
        "aperture_m": 2.0,
    },
    "devasthal": {
        "name": "Devasthal Optical Telescope",
        "code": "DOT-DVS",
        "latitude_deg": 29.3608,
        "longitude_deg": 79.6839,
        "elevation_m": 2540.0,
        "aperture_m": 3.6,
    },
}

# scheduler/taxonomy.py
# Implements priority tiers, scientific value scaling, and scoring weights

from config import TIER_3, TIER_2, TIER_1, TIER_0

# Logarithmic weights representing relative scientific importance
SCIENTIFIC_WEIGHTS = {
    TIER_3: 1000.0,  # Irreplaceable planetary defense / transient events
    TIER_2: 250.0,   # High-value targets (Type Ia Supernovae precursors)
    TIER_1: 50.0,    # Exoplanet transits
    TIER_0: 5.0,     # Routine photometry or sky surveys
}

def get_scientific_value(tier: int) -> float:
    """Returns the numerical scientific value (weight) for an observation's tier."""
    return SCIENTIFIC_WEIGHTS.get(tier, 1.0)

def is_irreplaceable(tier: int) -> bool:
    """Checks if an observation tier is classified as irreplaceable."""
    return tier >= TIER_3

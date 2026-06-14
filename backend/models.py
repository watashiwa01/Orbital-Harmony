# models.py
# Core data models for the Orbital Harmony system

from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Observatory:
    id: str
    name: str
    code: str
    latitude_deg: float
    longitude_deg: float
    elevation_m: float
    aperture_m: float

@dataclass
class Observation:
    id: str
    name: str
    observatory_id: str
    ra_deg: float
    dec_deg: float
    tier: int
    category: str
    start_min: float  # offset in minutes from sim start
    duration_min: float
    description: str

@dataclass
class Satellite:
    id: str
    name: str
    norad: int
    constellation: str
    altitude_km: float
    inclination_deg: float
    raan: float  # right ascension of ascending node (rad)
    mean_anomaly_0: float  # mean anomaly at epoch (rad)
    period_min: float
    tle1: Optional[str] = None
    tle2: Optional[str] = None

@dataclass
class InterferenceEvent:
    satellite_id: str
    satellite_name: str
    observatory_id: str
    target_id: str
    start_sec: float
    end_sec: float
    probability: float
    duration_sec: float

@dataclass
class ScheduleDecision:
    target_id: str
    observatory_id: str
    satellite_id: str
    satellite_name: str
    probability: float
    original_start: float  # sim seconds
    new_start: float       # sim seconds
    shift_min: float
    reasoning: List[str] = field(default_factory=list)
    confidence: float = 0.95

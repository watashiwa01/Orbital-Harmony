# physics/solar.py
# Computes solar position and twilight windows for simulated observatories

import math
from datetime import datetime

def get_sun_elevation(lat_deg: float, lon_deg: float, dt: datetime) -> float:
    """
    Approximates the solar elevation angle (altitude) in degrees.
    Uses standard solar declination and equation of time equations.
    """
    day_of_year = dt.timetuple().tm_yday
    hour_utc = dt.hour + dt.minute / 60.0 + dt.second / 3600.0

    # Solar declination angle (declination of sun in radians)
    # Cooper equation approximation
    declination = 0.409 * math.sin(2.0 * math.pi / 365.0 * (284 + day_of_year))

    # Fractional year in radians
    gamma = 2.0 * math.pi / 365.0 * (day_of_year - 1 + (hour_utc - 12.0) / 24.0)
    
    # Equation of time in minutes
    eq_time = 229.18 * (0.000075 + 0.001868 * math.cos(gamma) - 0.032077 * math.sin(gamma)
                        - 0.014615 * math.cos(2.0 * gamma) - 0.040849 * math.sin(2.0 * gamma))

    # Time offset in minutes
    time_offset = eq_time + 4.0 * lon_deg
    solar_time = hour_utc * 60.0 + time_offset  # solar time in minutes

    # Hour angle in radians
    hour_angle_rad = (solar_time / 4.0 - 180.0) * math.pi / 180.0

    lat_rad = math.radians(lat_deg)

    # Elevation calculation
    sin_el = (math.sin(lat_rad) * math.sin(declination) +
              math.cos(lat_rad) * math.cos(declination) * math.cos(hour_angle_rad))

    # Clamp to avoid rounding errors out of domain [-1, 1]
    sin_el = max(-1.0, min(1.0, sin_el))
    
    return math.degrees(math.asin(sin_el))

def is_night(lat_deg: float, lon_deg: float, dt: datetime) -> bool:
    """
    Observing requires astronomical twilight or darker (Sun altitude <= -18 degrees).
    """
    elevation = get_sun_elevation(lat_deg, lon_deg, dt)
    return elevation <= -18.0

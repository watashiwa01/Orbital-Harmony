# physics/propagation.py
# Propagation and coordinate transformation math for satellite orbits

import math
from datetime import datetime
from config import EARTH_RADIUS_KM, MU

# Try importing standard sgp4 library for real TLE propagation
try:
    from sgp4.api import Satrec, jday
    SGP4_AVAILABLE = True
except ImportError:
    SGP4_AVAILABLE = False

def propagate_satellite(sat, t_sec: float) -> tuple[float, float, float]:
    """
    Propagates a satellite to t_sec relative to epoch.
    Returns ECI position (x, y, z) in km.
    """
    if SGP4_AVAILABLE and sat.tle1 and sat.tle2:
        try:
            # April 10, 2026 00:00:00 UTC
            jd, fr = jday(2026, 4, 10, 0, 0, t_sec)
            satrec = Satrec.twoline2rv(sat.tle1, sat.tle2)
            error, pos, vel = satrec.sgp4(jd, fr)
            if error == 0:
                return pos[0], pos[1], pos[2]
        except Exception:
            pass

    # Circular orbit fallback (analytical propagation)
    period_sec = sat.period_min * 60
    n = (2.0 * math.pi) / period_sec
    M = sat.mean_anomaly_0 + n * t_sec
    r = EARTH_RADIUS_KM + sat.altitude_km

    x_orb = r * math.cos(M)
    y_orb = r * math.sin(M)

    i = math.radians(sat.inclination_deg)
    x1 = x_orb
    y1 = y_orb * math.cos(i)
    z1 = y_orb * math.sin(i)

    c_r = math.cos(sat.raan)
    s_r = math.sin(sat.raan)
    x = x1 * c_r - y1 * s_r
    y = x1 * s_r + y1 * c_r
    z = z1
    return x, y, z

def eci_to_geodetic(x: float, y: float, z: float, t_sec: float) -> tuple[float, float, float]:
    """
    Converts ECI position (km) to Lat (rad), Lon (rad), and Altitude (km).
    Accounts for Earth rotation rate (approx 7.292115e-5 rad/s).
    """
    r = math.sqrt(x*x + y*y + z*z)
    lat_rad = math.asin(z / r)
    
    # Earth rotation offset
    earth_rot = 7.292115e-5 * t_sec
    lon_rad = math.atan2(y, x) - earth_rot
    
    # Normalize longitude to [-pi, pi]
    lon_rad = (lon_rad + math.pi) % (2.0 * math.pi) - math.pi
    alt_km = r - EARTH_RADIUS_KM
    return lat_rad, lon_rad, alt_km

def geodetic_to_ecef(lat_rad: float, lon_rad: float, alt_km: float) -> tuple[float, float, float]:
    """Converts Geodetic coordinates to Earth-Centered Earth-Fixed (ECEF) in km."""
    r = EARTH_RADIUS_KM + alt_km
    x = r * math.cos(lat_rad) * math.cos(lon_rad)
    y = r * math.cos(lat_rad) * math.sin(lon_rad)
    z = r * math.sin(lat_rad)
    return x, y, z

def ecef_to_look_angles(
    obs_lat_deg: float,
    obs_lon_deg: float,
    obs_elev_m: float,
    sat_ecef: tuple[float, float, float]
) -> tuple[float, float, float]:
    """
    Converts ECEF sat position to observer-relative Azimuth (deg), Elevation (deg), and Range (km).
    """
    obs_lat = math.radians(obs_lat_deg)
    obs_lon = math.radians(obs_lon_deg)
    obs_alt_km = obs_elev_m / 1000.0

    # Observer position in ECEF
    obs_x, obs_y, obs_z = geodetic_to_ecef(obs_lat, obs_lon, obs_alt_km)

    # Range vector
    rx = sat_ecef[0] - obs_x
    ry = sat_ecef[1] - obs_y
    rz = sat_ecef[2] - obs_z

    # Rotate ECEF to local horizontal ENU (East, North, Up) coordinates
    sin_lat = math.sin(obs_lat)
    cos_lat = math.cos(obs_lat)
    sin_lon = math.sin(obs_lon)
    cos_lon = math.cos(obs_lon)

    e = -sin_lon * rx + cos_lon * ry
    n = -sin_lat * cos_lon * rx - sin_lat * sin_lon * ry + cos_lat * rz
    u = cos_lat * cos_lon * rx + cos_lat * sin_lon * ry + sin_lat * rz

    range_dist = math.sqrt(e*e + n*n + u*u)
    elevation = math.asin(u / range_dist)
    azimuth = math.atan2(e, n)

    # Normalize azimuth to [0, 2pi]
    azimuth = azimuth % (2.0 * math.pi)

    return math.degrees(azimuth), math.degrees(elevation), range_dist

# Refactored position coordinates math for Keplerian Kepler-3 approximation

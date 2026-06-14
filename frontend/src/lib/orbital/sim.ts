// Lightweight orbital simulation utilities. Uses satellite.js for real
// SGP4 propagation and falls back to a circular shell model if needed.
import * as satellite from "satellite.js";

export type Constellation = "STARLINK" | "ONEWEB" | "IRIDIUM" | "GPS";

export interface Sat {
  id: string;
  name: string;
  norad: number;
  constellation: Constellation;
  altitudeKm: number;
  inclinationDeg: number;
  raan: number; // right ascension of ascending node (rad)
  meanAnomaly0: number; // rad at t=0
  periodMin: number;
  tle1?: string;
  tle2?: string;
  satrec?: any; // parsed satrec
}

export interface Observatory {
  id: string;
  name: string;
  code: string;
  latDeg: number;
  lonDeg: number;
  elevationM: number;
  apertureM: number;
}

export const EARTH_RADIUS_KM = 6371;

export function orbitalPeriodMin(altitudeKm: number): number {
  const mu = 398600.4418; // km^3/s^2
  const a = EARTH_RADIUS_KM + altitudeKm;
  const T = 2 * Math.PI * Math.sqrt((a * a * a) / mu); // seconds
  return T / 60;
}

// Generates correct TLE format for satellite.js SGP4 propagator
export function generateTle(
  norad: number,
  inclinationDeg: number,
  raanRad: number,
  meanAnomalyRad: number,
  altitudeKm: number,
): [string, string] {
  const noradStr = String(norad).padStart(5, "0");
  
  // Line 1: standard TLE format with dummy epoch (year 2026, day 100.0)
  const line1 = `1 ${noradStr}U 26001A   26100.00000000  .00000000  00000-0  00000-0 0  9993`;

  // Line 2: orbital elements
  const incStr = inclinationDeg.toFixed(4).padStart(8, " ");
  const raanDeg = (raanRad * 180) / Math.PI;
  const raanStr = raanDeg.toFixed(4).padStart(8, " ");
  const eccStr = "0001000"; // nearly circular
  const argPerigeeStr = "  0.0000";
  const meanAnomalyDeg = (meanAnomalyRad * 180) / Math.PI;
  const maStr = meanAnomalyDeg.toFixed(4).padStart(8, " ");
  const periodMin = orbitalPeriodMin(altitudeKm);
  const meanMotion = 1440 / periodMin;
  const mmStr = meanMotion.toFixed(8).padStart(11, " ");

  const line2 = `2 ${noradStr} ${incStr} ${raanStr} ${eccStr} ${argPerigeeStr} ${maStr} ${mmStr}10000`;
  return [line1, line2];
}

// SGP4 propagation of satellite using satellite.js
export function satPosition(sat: Sat, tSec: number): [number, number, number] {
  if (!sat.satrec && sat.tle1 && sat.tle2) {
    try {
      sat.satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    } catch (e) {
      console.error("Failed to parse TLE for satellite", sat.name, e);
    }
  }

  if (sat.satrec) {
    try {
      // Use fixed epoch date (2026 day 100.0 = April 10, 2026 00:00:00 UTC)
      const epochDate = new Date(Date.UTC(2026, 3, 10, 0, 0, 0));
      const propagationDate = new Date(epochDate.getTime() + tSec * 1000);
      const positionAndVelocity = satellite.propagate(sat.satrec, propagationDate);
      const pos = positionAndVelocity.position;
      if (pos && typeof pos === "object" && "x" in pos && "y" in pos && "z" in pos) {
        return [pos.x as number, pos.y as number, pos.z as number];
      }
    } catch (e) {
      console.error("Error in satellite propagation", sat.name, e);
    }
  }

  // Fallback to circular
  return fallbackSatPosition(sat, tSec);
}

function fallbackSatPosition(sat: Sat, tSec: number): [number, number, number] {
  const n = (2 * Math.PI) / (sat.periodMin * 60); // rad/s
  const M = sat.meanAnomaly0 + n * tSec;
  const r = EARTH_RADIUS_KM + sat.altitudeKm;
  // Circular orbit in its plane
  const xOrb = r * Math.cos(M);
  const yOrb = r * Math.sin(M);
  // Rotate by inclination around x-axis
  const i = (sat.inclinationDeg * Math.PI) / 180;
  const x1 = xOrb;
  const y1 = yOrb * Math.cos(i);
  const z1 = yOrb * Math.sin(i);
  // Rotate by RAAN around z-axis
  const cR = Math.cos(sat.raan);
  const sR = Math.sin(sat.raan);
  const x = x1 * cR - y1 * sR;
  const y = x1 * sR + y1 * cR;
  const z = z1;
  return [x, y, z];
}

export function latLonToVec3(latDeg: number, lonDeg: number, radius: number): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = -radius * Math.cos(lat) * Math.sin(lon);
  return [x, y, z];
}

// Procedural constellation generator with SGP4 TLE fields
export function generateConstellation(
  prefix: string,
  count: number,
  altitudeKm: number,
  inclinationDeg: number,
  noradStart: number,
  constellation: Constellation,
): Sat[] {
  const planes = Math.max(4, Math.round(Math.sqrt(count)));
  const perPlane = Math.ceil(count / planes);
  const periodMin = orbitalPeriodMin(altitudeKm);
  const sats: Sat[] = [];
  let idx = 0;
  for (let p = 0; p < planes; p++) {
    const raan = (p / planes) * 2 * Math.PI;
    for (let k = 0; k < perPlane && idx < count; k++) {
      const meanAnomaly0 = ((k + (p % 2) * 0.5) / perPlane) * 2 * Math.PI;
      const [tle1, tle2] = generateTle(noradStart + idx, inclinationDeg, raan, meanAnomaly0, altitudeKm);
      sats.push({
        id: `${prefix}-${idx}`,
        name: `${prefix}-${noradStart + idx}`,
        norad: noradStart + idx,
        constellation,
        altitudeKm,
        inclinationDeg,
        raan,
        meanAnomaly0,
        periodMin,
        tle1,
        tle2,
      });
      idx++;
    }
  }
  return sats;
}

export function satGeodeticPosition(
  sat: Sat,
  tSec: number,
): { latRad: number; lonRad: number; heightKm: number } | null {
  if (!sat.satrec && sat.tle1 && sat.tle2) {
    try {
      sat.satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    } catch (e) {
      return null;
    }
  }

  if (sat.satrec) {
    try {
      const epochDate = new Date(Date.UTC(2026, 3, 10, 0, 0, 0));
      const propagationDate = new Date(epochDate.getTime() + tSec * 1000);
      const positionAndVelocity = satellite.propagate(sat.satrec, propagationDate);
      const pos = positionAndVelocity.position;
      if (pos && typeof pos === "object" && "x" in pos && "y" in pos && "z" in pos) {
        const gmst = satellite.gstime(propagationDate);
        const geodetic = satellite.eciToGeodetic(pos as any, gmst);
        return {
          latRad: geodetic.latitude,
          lonRad: geodetic.longitude,
          heightKm: geodetic.height,
        };
      }
    } catch (e) {
      console.error("Geodetic propagation error:", e);
    }
  }
  return null;
}

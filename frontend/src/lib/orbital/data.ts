import { generateConstellation, type Observatory, type Sat } from "./sim";

export const OBSERVATORIES: Observatory[] = [
  {
    id: "hanle",
    name: "Indian Astronomical Observatory, Hanle",
    code: "IAO-HNL",
    latDeg: 32.7794,
    lonDeg: 78.9642,
    elevationM: 4500,
    apertureM: 2.0,
  },
  {
    id: "devasthal",
    name: "Devasthal Optical Telescope",
    code: "DOT-DVS",
    latDeg: 29.3608,
    lonDeg: 79.6839,
    elevationM: 2540,
    apertureM: 3.6,
  },
];

export const SATELLITES: Sat[] = [
  ...generateConstellation("STARLINK", 280, 550, 53, 44700, "STARLINK"),
  ...generateConstellation("ONEWEB", 120, 1200, 87.4, 47000, "ONEWEB"),
  ...generateConstellation("IRIDIUM", 60, 780, 86.4, 41900, "IRIDIUM"),
];

export type TargetTier = 0 | 1 | 2 | 3;

export interface ObsTarget {
  id: string;
  name: string;
  observatoryId: string;
  raDeg: number;
  decDeg: number;
  tier: TargetTier;
  category: string;
  startMin: number; // minutes from "now"
  durationMin: number;
  description: string;
}

export const TARGETS: ObsTarget[] = [
  {
    id: "t1",
    name: "2024 PT5 — Near-Earth Asteroid",
    observatoryId: "hanle",
    raDeg: 142.3,
    decDeg: 18.2,
    tier: 3,
    category: "Planetary Defense",
    startMin: 5,
    durationMin: 22,
    description: "Astrometric follow-up of recently discovered NEO. Impact risk assessment.",
  },
  {
    id: "t2",
    name: "SN 2026aap — Type Ia Supernova",
    observatoryId: "devasthal",
    raDeg: 201.4,
    decDeg: -12.7,
    tier: 2,
    category: "Supernova Follow-up",
    startMin: 18,
    durationMin: 35,
    description: "Spectroscopic time-series of rare Type Ia precursor. Light curve critical.",
  },
  {
    id: "t3",
    name: "TOI-2406 b — Exoplanet Transit",
    observatoryId: "devasthal",
    raDeg: 65.8,
    decDeg: -6.4,
    tier: 1,
    category: "Exoplanet Transit",
    startMin: 40,
    durationMin: 95,
    description: "Atmospheric characterization via transmission spectroscopy.",
  },
  {
    id: "t4",
    name: "VVV Survey — Galactic Bulge",
    observatoryId: "hanle",
    raDeg: 270.0,
    decDeg: -29.0,
    tier: 0,
    category: "Routine Survey",
    startMin: 0,
    durationMin: 240,
    description: "Variable star catalog photometry. Reschedulable.",
  },
  {
    id: "t5",
    name: "GRB 260613A — Afterglow",
    observatoryId: "hanle",
    raDeg: 89.1,
    decDeg: 41.2,
    tier: 3,
    category: "Planetary Defense",
    startMin: 75,
    durationMin: 30,
    description: "Gamma-ray burst optical counterpart. Fading rapidly.",
  },
];

export const TIER_META: Record<TargetTier, { label: string; color: string; var: string }> = {
  3: { label: "TIER 3 — IRREPLACEABLE", color: "tier-3", var: "var(--tier-3)" },
  2: { label: "TIER 2 — HIGH VALUE", color: "tier-2", var: "var(--tier-2)" },
  1: { label: "TIER 1 — TIME-CRITICAL", color: "tier-1", var: "var(--tier-1)" },
  0: { label: "TIER 0 — ROUTINE", color: "tier-0", var: "var(--tier-0)" },
};

export const CONSTELLATION_COLOR: Record<string, string> = {
  STARLINK: "#7dd3fc",
  ONEWEB: "#fbbf24",
  IRIDIUM: "#c4b5fd",
  GPS: "#86efac",
};

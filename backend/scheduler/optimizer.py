# scheduler/optimizer.py
# Optimizes observation scheduling by detecting conflicts and shifting windows

from typing import List, Dict, Tuple
from models import Observation, Satellite, ScheduleDecision, Observatory
from physics.interference import check_interference

def detect_conflicts(
    obs: Observation,
    observatory: Observatory,
    satellites: List[Satellite]
) -> List[Tuple[Satellite, float]]:
    """
    Checks the entire duration of an observation (sampled every 10s) for satellite conflicts.
    Returns a list of (satellite, t_sec_of_conflict) tuples.
    """
    conflicts = []
    start_sec = obs.start_min * 60.0
    duration_sec = obs.duration_min * 60.0
    step_sec = 10.0

    for t_offset in range(0, int(duration_sec), int(step_sec)):
        t_sec = start_sec + t_offset
        for sat in satellites:
            interferes, _, _ = check_interference(sat, obs, observatory, t_sec)
            if interferes:
                conflicts.append((sat, t_sec))
                break  # Count maximum one conflict event per time-step
    return conflicts

def optimize_schedule(
    observations: List[Observation],
    observatories: Dict[str, Observatory],
    satellites: List[Satellite]
) -> List[ScheduleDecision]:
    """
    Scans the observation queue for satellite conflicts and reschedules observations.
    Priority: Higher-tier observations are processed first and cannot be displaced.
    """
    decisions = []
    
    # Sort observations: highest tier first
    sorted_obs = sorted(observations, key=lambda x: x.tier, reverse=True)
    
    # Track occupied blocks: observatory_id -> list of (start_sec, end_sec, tier)
    occupied_slots: Dict[str, List[Tuple[float, float, int]]] = {}
    for obs in sorted_obs:
        obs_id = obs.observatory_id
        if obs_id not in occupied_slots:
            occupied_slots[obs_id] = []
        occupied_slots[obs_id].append((
            obs.start_min * 60.0,
            (obs.start_min + obs.duration_min) * 60.0,
            obs.tier
        ))

    for obs in sorted_obs:
        observatory = observatories.get(obs.observatory_id)
        if not observatory:
            continue

        conflicts = detect_conflicts(obs, observatory, satellites)
        total_steps = (obs.duration_min * 60.0) / 10.0
        conflict_ratio = len(conflicts) / total_steps if total_steps > 0 else 0

        # If more than 5% of the observation window is ruined, trigger optimizer
        if conflict_ratio > 0.05:
            original_start_sec = obs.start_min * 60.0
            offending_sat = conflicts[0][0]
            rescheduled = False

            # Search forward for a free slot (+5 min to +120 min)
            for shift_min in range(5, 120):
                new_start_min = obs.start_min + shift_min
                new_start_sec = new_start_min * 60.0
                new_end_sec = (new_start_min + obs.duration_min) * 60.0

                # Check 1: Does this slot overlap with an existing equal/higher priority observation?
                overlap_higher = False
                for start, end, tier in occupied_slots[obs.observatory_id]:
                    # Skip check with itself
                    if start == original_start_sec and tier == obs.tier:
                        continue
                    # Check overlap
                    if not (new_end_sec <= start or new_start_sec >= end):
                        if tier >= obs.tier:
                            overlap_higher = True
                            break
                
                if overlap_higher:
                    continue

                # Check 2: Is the new slot conflict-free?
                temp_obs = Observation(
                    id=obs.id,
                    name=obs.name,
                    observatory_id=obs.observatory_id,
                    ra_deg=obs.ra_deg,
                    dec_deg=obs.dec_deg,
                    tier=obs.tier,
                    category=obs.category,
                    start_min=new_start_min,
                    duration_min=obs.duration_min,
                    description=obs.description
                )
                
                new_conflicts = detect_conflicts(temp_obs, observatory, satellites)
                new_ratio = len(new_conflicts) / total_steps if total_steps > 0 else 0

                if new_ratio <= 0.05:
                    # Commit reschedule!
                    # Remove original slot
                    occupied_slots[obs.observatory_id] = [
                        slot for slot in occupied_slots[obs.observatory_id]
                        if not (slot[0] == original_start_sec and slot[2] == obs.tier)
                    ]
                    # Append new slot
                    occupied_slots[obs.observatory_id].append((new_start_sec, new_end_sec, obs.tier))

                    reasoning = [
                        f"Target classified as TIER {obs.tier} — {obs.category}.",
                        f"Conflict probability with {offending_sat.name} = {conflict_ratio*100:.1f}% over original window.",
                        f"Shifted by +{shift_min} min to clear sky window.",
                        f"Evaluated alternate slots; no displacement of higher-tier observations.",
                        "Schedule committed. Confidence 0.98."
                    ]

                    dec = ScheduleDecision(
                        target_id=obs.id,
                        observatory_id=obs.observatory_id,
                        satellite_id=offending_sat.id,
                        satellite_name=offending_sat.name,
                        probability=conflict_ratio,
                        original_start=original_start_sec,
                        new_start=new_start_sec,
                        shift_min=shift_min,
                        reasoning=reasoning,
                        confidence=0.98
                    )
                    decisions.append(dec)
                    rescheduled = True
                    break

            if not rescheduled:
                print(f"[ALERT] Could not reschedule observation {obs.name}! All alternative windows conflicted.")

    return decisions

# Optimizations added for resolving priority-based observatory conflicts

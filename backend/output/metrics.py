# output/metrics.py
# Computes metrics like percentage of science recovered and telescope cost saved

from typing import List
from models import Observation, ScheduleDecision
from scheduler.taxonomy import get_scientific_value

def calculate_metrics(
    observations: List[Observation],
    decisions: List[ScheduleDecision]
) -> dict:
    """
    Computes schedule efficiency, recovered scientific value, and financial cost avoided.
    Telescope cost estimate: $5,000 / hour.
    """
    total_val = sum(get_scientific_value(o.tier) for o in observations)
    
    rescheduled_ids = {d.target_id for d in decisions}
    recovered_val = sum(get_scientific_value(o.tier) for o in observations if o.id in rescheduled_ids)
    
    # Calculate total observation hours that were rescued
    hours_rescued = sum(o.duration_min for o in observations if o.id in rescheduled_ids) / 60.0
    cost_saved = hours_rescued * 5000.0  # $5k/hour operating cost
    
    recovery_percent = (recovered_val / total_val) * 100.0 if total_val > 0 else 100.0

    return {
        "recovery_percent": recovery_percent,
        "hours_rescued": hours_rescued,
        "cost_saved_usd": cost_saved,
        "total_observations": len(observations),
        "rescheduled_observations": len(decisions),
    }

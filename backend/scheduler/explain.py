# scheduler/explain.py
# Formats AI scheduling decisions and generates natural language explanations

from models import ScheduleDecision, Observation
from config import TIERS

def format_decision_explanation(decision: ScheduleDecision, obs: Observation) -> str:
    """Generates a structured, human-readable terminal log explaining the decision."""
    tier_label = TIERS.get(obs.tier, f"Tier {obs.tier}")
    
    orig_hour = int((decision.original_start // 3600))
    orig_min = int((decision.original_start % 3600) // 60)
    
    new_hour = int((decision.new_start // 3600))
    new_min = int((decision.new_start % 3600) // 60)
    
    orig_time = f"T+{orig_hour:02d}:{orig_min:02d}"
    new_time = f"T+{new_hour:02d}:{new_min:02d}"

    lines = [
        f"[{decision.satellite_name} CONFLICT] {obs.name} ({tier_label}) affected.",
        f"  Original window  : {orig_time} -> {obs.duration_min} minutes",
        f"  Action taken     : Rescheduled to {new_time} (+{decision.shift_min} min shift)",
        "  AI Core Reasoning Trace:"
    ]
    for reason in decision.reasoning:
        lines.append(f"    * {reason}")
        
    return "\n".join(lines)

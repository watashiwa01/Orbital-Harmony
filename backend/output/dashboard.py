# output/dashboard.py
# Formats and prints the terminal-based Mission Control HUD

def print_hud_header():
    print("=" * 80)
    print("               ORBITAL HARMONY — AUTONOMOUS MISSION CONTROL CLI v1.0")
    print("               Status: UPLINK NOMINAL | Live Telemetry: ACTIVE")
    print("=" * 80)

def print_metrics_dashboard(metrics: dict):
    print("\n" + "[-]" * 10 + " PERFORMANCE SUMMATION CARD " + "[-]" * 10)
    print(f"  Total Ingested Observations   : {metrics['total_observations']}")
    print(f"  Interfered Targets Protected  : {metrics['rescheduled_observations']}")
    print(f"  Scientific Recovery Rate      : {metrics['recovery_percent']:.1f}%")
    print(f"  Recovered Operating Exposure  : {metrics['hours_rescued']:.2f} hours")
    print(f"  Estimated Cost Avoided (USD)  : ${metrics['cost_saved_usd']:,.2f}")
    print("=" * 80)

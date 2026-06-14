# main.py
# Main entry point for the Orbital Harmony autonomous operations simulation

import sys
import os

# Append current directory to path to enable package resolution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.loop import run_simulation

def main():
    try:
        run_simulation()
    except KeyboardInterrupt:
        print("\n[INFO] Simulation interrupted by operator.")
        sys.exit(0)

if __name__ == "__main__":
    main()

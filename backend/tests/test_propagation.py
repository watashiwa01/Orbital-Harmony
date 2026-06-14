import unittest
import math
from core.loop import parse_satellites_from_tle

class TestPropagation(unittest.TestCase):
    def test_tle_parsing(self):
        tle_text = """STARLINK-5472
1 54720U 22100A   26100.00000000  .00000000  00000-0  00000-0 0  9993
2 54720  53.0000  24.0153 0001000   0.0000 329.8973 15.0600000010000"""
        sats = parse_satellites_from_tle(tle_text)
        self.assertEqual(len(sats), 1)
        self.assertEqual(sats[0].constellation, "STARLINK")
        self.assertGreater(sats[0].period_min, 0)

if __name__ == '__main__':
    unittest.main()

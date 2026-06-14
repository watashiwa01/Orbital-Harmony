import unittest
from models import Observation
from scheduler.optimizer import optimize_schedule

class TestOptimizer(unittest.TestCase):
    def test_empty_schedule(self):
        decisions = optimize_schedule([], {}, [])
        self.assertEqual(len(decisions), 0)

if __name__ == '__main__':
    unittest.main()

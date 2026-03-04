import unittest
from datetime import datetime, time
from unittest.mock import patch, MagicMock
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

from scripts.market_utils import get_last_market_close, interpret_mmi

class TestReportFixes(unittest.TestCase):
    
    def setUp(self):
        self.tz = ZoneInfo("Asia/Kolkata")

    @patch('scripts.market_utils.datetime')
    def test_weekend_generation(self, mock_dt):
        # Case: Saturday Morning (Jan 25, 2026 is a Sunday, Jan 24 is Sat)
        # 2026-01-24 is Saturday. 2026-01-25 is Sunday.
        # Let's say we run on Saturday Jan 24, 2026 at 10 AM.
        # Logic should return Friday Jan 23, 2026 at 15:30.
        
        mock_now = datetime(2026, 1, 24, 10, 0, 0, tzinfo=self.tz) # Saturday
        mock_dt.now.return_value = mock_now
        # Side effect for other calls if needed, but get_last_market_close only calls now()
        
        expected = datetime(2026, 1, 23, 15, 30, 0, tzinfo=self.tz)
        result = get_last_market_close()
        
        self.assertEqual(result.date(), expected.date())
        self.assertEqual(result.hour, 15)
        self.assertEqual(result.minute, 30)

    @patch('scripts.market_utils.datetime')
    def test_sunday_generation(self, mock_dt):
        # Case: Sunday Jan 25, 2026
        mock_now = datetime(2026, 1, 25, 10, 0, 0, tzinfo=self.tz)
        mock_dt.now.return_value = mock_now
        
        # Should go back to Friday Jan 23
        expected = datetime(2026, 1, 23, 15, 30, 0, tzinfo=self.tz)
        result = get_last_market_close()
        self.assertEqual(result.date(), expected.date())

    @patch('scripts.market_utils.datetime')
    def test_weekday_before_market_close(self, mock_dt):
        # Case: Monday Jan 26, 2026 at 10 AM (Republic Day usually closed, but let's assume normal Mon)
        # If Monday morning, should return Friday close (since Sun/Sat skipped).
        # Actually Jan 26 is Monday.
        mock_now = datetime(2026, 1, 26, 10, 0, 0, tzinfo=self.tz)
        mock_dt.now.return_value = mock_now
        
        # Logic: 
        # 1. now.hour < 15 -> market_date = now - 1 day (Sunday Jan 25)
        # 2. While loop checks if Sunday (6>=5) -> market_date - 1 (Saturday Jan 24)
        # 3. while checks Saturday (5>=5) -> market_date - 1 (Friday Jan 23)
        # 4. Returns Friday Jan 23.
        
        expected = datetime(2026, 1, 23, 15, 30, 0, tzinfo=self.tz) # Friday
        result = get_last_market_close()
        self.assertEqual(result.date(), expected.date())

    @patch('scripts.market_utils.datetime')
    def test_weekday_after_market_close(self, mock_dt):
        # Case: Friday Jan 23, 2026 at 16:00 (4 PM)
        mock_now = datetime(2026, 1, 23, 16, 0, 0, tzinfo=self.tz)
        mock_dt.now.return_value = mock_now
        
        expected = datetime(2026, 1, 23, 15, 30, 0, tzinfo=self.tz)
        result = get_last_market_close()
        self.assertEqual(result.date(), expected.date())

    def test_mmi_thresholds(self):
        # Test exact boundaries requested
        # Extreme Fear: 0-30
        self.assertIn("Extreme Fear", interpret_mmi(0))
        self.assertIn("Extreme Fear", interpret_mmi(29.9))
        
        # Fear: 30-50
        self.assertIn("Fear", interpret_mmi(30.0))
        self.assertIn("Fear", interpret_mmi(40.5)) # The reported bug
        self.assertIn("Fear", interpret_mmi(49.9))
        
        # Neutral: 50-55
        self.assertIn("Neutral", interpret_mmi(50.0))
        self.assertIn("Neutral", interpret_mmi(52.5))
        self.assertIn("Neutral", interpret_mmi(54.9))
        
        # Greed: 55-70
        self.assertIn("Greed", interpret_mmi(55.0))
        self.assertIn("Greed", interpret_mmi(69.9))
        
        # Extreme Greed: 70-100
        self.assertIn("Extreme Greed", interpret_mmi(70.0))
        self.assertIn("Extreme Greed", interpret_mmi(100.0))

    def test_mmi_movement_text(self):
        # Test improvement/decline text
        msg = interpret_mmi(40.5, 38.0) # Delta +2.5 (<5)
        self.assertIn("slight improvement", msg)
        
        msg = interpret_mmi(40.5, 30.0) # Delta +10.5 (>=5)
        self.assertIn("improved to", msg)
        
        msg = interpret_mmi(40.5, 42.0) # Delta -1.5 (<5)
        self.assertIn("slight decline", msg)
        
        msg = interpret_mmi(25.0, 35.0) # Delta -10
        self.assertIn("declined to", msg)

class TestFiiDiiMonthFilter(unittest.TestCase):
    """Tests for the FII/DII current-month filter logic in fetch_fiidii()."""

    def _apply_month_filter(self, data, run_date):
        """Helper: replicate the month filter logic from fetch_fiidii()."""
        start_of_month = run_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return [
            d for d in data
            if datetime.strptime(d['date'], '%d-%m-%Y') >= start_of_month
        ]

    def _make_entry(self, date_str):
        return {'date': date_str, 'fii': 100.0, 'dii': 200.0}

    def test_previous_month_entries_excluded_at_month_start(self):
        """When we're in March, February entries must not appear in daily_data."""
        data = [
            self._make_entry('27-02-2026'),
            self._make_entry('26-02-2026'),
            self._make_entry('25-02-2026'),
        ]
        run_date = datetime(2026, 3, 1, 9, 0, 0)  # First day of March
        result = self._apply_month_filter(data, run_date)
        self.assertEqual(result, [], "February entries should be excluded when running in March")

    def test_current_month_entries_included(self):
        """Entries from the current month must appear in daily_data."""
        data = [
            self._make_entry('04-03-2026'),
            self._make_entry('03-03-2026'),
            self._make_entry('27-02-2026'),  # Previous month
        ]
        run_date = datetime(2026, 3, 4, 15, 0, 0)
        result = self._apply_month_filter(data, run_date)
        dates = [d['date'] for d in result]
        self.assertIn('04-03-2026', dates)
        self.assertIn('03-03-2026', dates)
        self.assertNotIn('27-02-2026', dates, "February entry must not be included in March")

    def test_month_boundary_first_day_included(self):
        """An entry dated the 1st of the current month must be included."""
        data = [self._make_entry('01-03-2026')]
        run_date = datetime(2026, 3, 1, 0, 0, 0)
        result = self._apply_month_filter(data, run_date)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['date'], '01-03-2026')

    def test_only_previous_month_data_yields_empty_daily_data(self):
        """If the cache has only previous month data, daily_data must be empty
        (not populated with previous month entries)."""
        data = [
            self._make_entry('28-02-2026'),
            self._make_entry('27-02-2026'),
            self._make_entry('26-02-2026'),
        ]
        run_date = datetime(2026, 3, 4, 10, 0, 0)
        result = self._apply_month_filter(data, run_date)
        self.assertEqual(result, [],
                         "When cache only has previous month data, daily_data should be empty")

    def test_filter_works_across_year_boundary(self):
        """Month filter must work correctly at a year boundary (December → January)."""
        data = [
            self._make_entry('01-01-2027'),
            self._make_entry('31-12-2026'),
            self._make_entry('30-12-2026'),
        ]
        run_date = datetime(2027, 1, 5, 10, 0, 0)
        result = self._apply_month_filter(data, run_date)
        dates = [d['date'] for d in result]
        self.assertIn('01-01-2027', dates)
        self.assertNotIn('31-12-2026', dates)
        self.assertNotIn('30-12-2026', dates)


if __name__ == '__main__':
    unittest.main()

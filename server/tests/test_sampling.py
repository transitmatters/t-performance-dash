"""Tests for sampling.py — resampling daily values to weekly or monthly."""

from datetime import date, timedelta

from chalicelib.sampling import resample_and_aggregate


def _daily(start: date, days: int) -> dict:
    return {(start + timedelta(days=offset)).isoformat(): offset for offset in range(days)}


class TestWeeklyResample:
    def test_monday_start_keeps_first_week(self):
        # 2026-09-07 is a Monday.
        result = resample_and_aggregate(_daily(date(2026, 9, 7), 14), "weekly", "mean")

        assert list(result) == ["2026-09-07", "2026-09-14"]
        assert result["2026-09-07"] == 3

    def test_midweek_start_drops_partial_week(self):
        # 2026-09-09 is a Wednesday; its week began 2026-09-07.
        result = resample_and_aggregate(_daily(date(2026, 9, 9), 12), "weekly", "mean")

        assert list(result) == ["2026-09-14"]

    def test_weeks_are_dated_by_monday(self):
        result = resample_and_aggregate(_daily(date(2026, 9, 7), 28), "weekly", "median")

        assert all(date.fromisoformat(day).weekday() == 0 for day in result)


class TestMonthlyResample:
    def test_first_of_month_start_keeps_first_month(self):
        # 2026-01-01 is a Thursday.
        result = resample_and_aggregate(_daily(date(2026, 1, 1), 59), "monthly", "median")

        assert list(result) == ["2026-01-31", "2026-02-28"]
        assert result["2026-01-31"] == 15

    def test_midmonth_start_drops_partial_month(self):
        result = resample_and_aggregate(_daily(date(2026, 1, 15), 45), "monthly", "median")

        assert list(result) == ["2026-02-28"]

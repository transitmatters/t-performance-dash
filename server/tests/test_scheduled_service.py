"""Tests for scheduled_service.py — picking example days for the service-by-hour chart."""

from datetime import date, timedelta

import pytest

from chalicelib.scheduled_service import get_next_day_kind_service_levels, get_service_levels

# Red Line trip counts from the beta API: Christmas runs a Sunday schedule.
TYPICAL_WEEKDAY_TRIPS = 454
HOLIDAY_TRIPS = 342


def day(iso_date, has_exceptions=False, trips=TYPICAL_WEEKDAY_TRIPS):
    """A ScheduledServiceDaily row, with all of a day's trips in its first hour."""
    return {
        "routeId": "Red",
        "date": iso_date,
        "count": trips,
        "serviceMinutes": 0,
        "hasServiceExceptions": has_exceptions,
        "byHour": {"totals": [trips] + [0] * 23},
    }


def days_between(start, end, exception_dates=()):
    """One row per day from start to end inclusive, flagging the given dates as exceptions."""
    rows = []
    current = date.fromisoformat(start)
    while current <= date.fromisoformat(end):
        iso_date = current.isoformat()
        is_exception = iso_date in exception_dates
        rows.append(day(iso_date, is_exception, HOLIDAY_TRIPS if is_exception else TYPICAL_WEEKDAY_TRIPS))
        current += timedelta(days=1)
    return rows


class TestGetNextDayKindServiceLevels:
    @pytest.mark.parametrize(
        "day_kind, expected_date",
        [
            ("weekday", "2026-01-30"),  # Friday
            ("saturday", "2026-01-31"),
            ("sunday", "2026-02-01"),
        ],
    )
    def test_returns_first_day_of_each_kind(self, day_kind, expected_date):
        scheduled_service = days_between("2026-01-30", "2026-02-02")

        result = get_next_day_kind_service_levels(scheduled_service, day_kind)

        assert result == {"date": expected_date, "service_levels": [TYPICAL_WEEKDAY_TRIPS] + [0] * 23}

    def test_returns_none_when_no_day_matches(self):
        scheduled_service = days_between("2026-01-26", "2026-01-30")  # Monday to Friday

        assert get_next_day_kind_service_levels(scheduled_service, "saturday") is None

    def test_missing_by_hour_gives_empty_service_levels(self):
        scheduled_service = [{"date": "2026-01-30", "count": 0, "hasServiceExceptions": False}]

        result = get_next_day_kind_service_levels(scheduled_service, "weekday")

        assert result == {"date": "2026-01-30", "service_levels": []}

    def test_skips_holiday_weekday(self):
        # Christmas (Thursday) has a calendar exception; the Friday after it doesn't.
        scheduled_service = days_between("2025-12-25", "2025-12-26", exception_dates={"2025-12-25"})

        result = get_next_day_kind_service_levels(scheduled_service, "weekday")

        assert result == {"date": "2025-12-26", "service_levels": [TYPICAL_WEEKDAY_TRIPS] + [0] * 23}

    def test_skips_exception_saturday(self):
        # July 4, 2026 is a Saturday.
        scheduled_service = days_between("2026-07-04", "2026-07-11", exception_dates={"2026-07-04"})

        result = get_next_day_kind_service_levels(scheduled_service, "saturday")

        assert result["date"] == "2026-07-11"

    def test_skips_run_of_exception_days(self):
        scheduled_service = days_between(
            "2025-12-31", "2026-01-05", exception_dates={"2025-12-31", "2026-01-01", "2026-01-02"}
        )

        result = get_next_day_kind_service_levels(scheduled_service, "weekday")

        assert result["date"] == "2026-01-05"

    def test_falls_back_to_first_match_when_every_match_has_exceptions(self):
        scheduled_service = [
            day("2025-12-25", has_exceptions=True, trips=HOLIDAY_TRIPS),
            day("2025-12-27"),  # Saturday, not a weekday
            day("2026-01-01", has_exceptions=True, trips=HOLIDAY_TRIPS + 1),
        ]

        result = get_next_day_kind_service_levels(scheduled_service, "weekday")

        assert result == {"date": "2025-12-25", "service_levels": [HOLIDAY_TRIPS] + [0] * 23}

    def test_row_without_exception_flag_counts_as_typical(self):
        scheduled_service = [
            day("2025-12-25", has_exceptions=True, trips=HOLIDAY_TRIPS),
            {"date": "2025-12-26", "byHour": {"totals": [1]}},
        ]

        result = get_next_day_kind_service_levels(scheduled_service, "weekday")

        assert result == {"date": "2025-12-26", "service_levels": [1]}


class TestGetServiceLevels:
    # The example from #1509: Red Line, 2025-12-25 to 2026-01-31.
    HOLIDAYS = {"2025-12-25", "2026-01-01", "2026-01-19"}

    def test_start_skips_holiday_at_start_of_range(self):
        scheduled_service = days_between("2025-12-25", "2026-01-31", self.HOLIDAYS)

        result = get_service_levels(scheduled_service, search_from_end=False)

        assert {kind: levels["date"] for kind, levels in result.items()} == {
            "weekday": "2025-12-26",
            "saturday": "2025-12-27",
            "sunday": "2025-12-28",
        }
        assert result["weekday"]["service_levels"][0] == TYPICAL_WEEKDAY_TRIPS

    def test_end_searches_backwards(self):
        scheduled_service = days_between("2025-12-25", "2026-01-31", self.HOLIDAYS)

        result = get_service_levels(scheduled_service, search_from_end=True)

        assert {kind: levels["date"] for kind, levels in result.items()} == {
            "weekday": "2026-01-30",
            "saturday": "2026-01-31",
            "sunday": "2026-01-25",
        }

    def test_end_skips_holidays_at_end_of_range(self):
        scheduled_service = days_between("2025-12-22", "2026-01-01", {"2025-12-25", "2025-12-31", "2026-01-01"})

        result = get_service_levels(scheduled_service, search_from_end=True)

        assert result["weekday"]["date"] == "2025-12-30"

    def test_does_not_reorder_input(self):
        scheduled_service = days_between("2026-01-26", "2026-01-31")
        original_order = [row["date"] for row in scheduled_service]

        get_service_levels(scheduled_service, search_from_end=True)

        assert [row["date"] for row in scheduled_service] == original_order

    def test_short_range_of_only_holidays_still_returns_them(self):
        scheduled_service = days_between("2025-12-25", "2025-12-25", {"2025-12-25"})

        start = get_service_levels(scheduled_service, search_from_end=False)
        end = get_service_levels(scheduled_service, search_from_end=True)

        assert start["weekday"]["date"] == end["weekday"]["date"] == "2025-12-25"
        assert start["saturday"] is None and start["sunday"] is None

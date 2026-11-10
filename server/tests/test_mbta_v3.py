"""Tests for mbta_v3.get_active -- whether a live alert period is current, upcoming, or both."""

from datetime import datetime
from unittest import mock

from chalicelib import mbta_v3

# 2:00 PM on a Tuesday in Boston
NOW = mbta_v3.bos_tz.localize(datetime(2026, 11, 10, 14, 0))


def period(start, end):
    return mbta_v3.get_active({"start": start, "end": end}, now=NOW)


def flags(result):
    return result["current"], result["upcoming"]


class TestGetActive:
    def test_tonight_into_tomorrow_is_current_and_upcoming(self):
        # Starts after noon today: was "upcoming only" when end of today was 11:59 AM.
        assert flags(period("2026-11-10T20:45:00-05:00", "2026-11-12T03:00:00-05:00")) == (True, True)

    def test_ended_earlier_today_is_neither(self):
        assert flags(period("2026-11-10T06:00:00-05:00", "2026-11-10T09:00:00-05:00")) == (False, False)

    def test_ends_before_4_am_tomorrow_is_current_only(self):
        assert flags(period("2026-11-10T21:00:00-05:00", "2026-11-11T02:00:00-05:00")) == (True, False)

    def test_starts_tomorrow_is_upcoming_only(self):
        assert flags(period("2026-11-11T21:00:00-05:00", "2026-11-12T02:00:00-05:00")) == (False, True)

    def test_open_ended_is_current(self):
        assert flags(period("2026-11-01T06:00:00-05:00", None)) == (True, False)

    def test_reads_the_clock_on_each_call(self):
        # A warm Lambda must not keep the time it was imported at.
        later = mbta_v3.bos_tz.localize(datetime(2026, 11, 10, 10, 0))
        with mock.patch.object(mbta_v3, "datetime", wraps=datetime) as clock:
            clock.now.return_value = later
            result = mbta_v3.get_active({"start": "2026-11-10T06:00:00-05:00", "end": "2026-11-10T11:00:00-05:00"})
        assert flags(result) == (True, False)

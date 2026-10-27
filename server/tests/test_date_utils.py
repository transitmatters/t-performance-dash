from datetime import date, datetime, timedelta, timezone

import pytest

from chalicelib.date_utils import EASTERN_TIME, current_service_date, parse_event_date


@pytest.mark.parametrize(
    "date_str, expected",
    [
        ("2026-10-08 05:52:28", datetime(2026, 10, 8, 5, 52, 28, tzinfo=EASTERN_TIME)),
        ("2026-10-08 05:52:28-04:00", datetime(2026, 10, 8, 5, 52, 28, tzinfo=timezone(timedelta(hours=-4)))),
        # Commuter Rail terminal arrivals written by gobble from 2026-10-04
        (
            "2026-10-08 05:52:28.367504-04:00",
            datetime(2026, 10, 8, 5, 52, 28, 367504, tzinfo=timezone(timedelta(hours=-4))),
        ),
    ],
)
def test_parse_event_date(date_str, expected):
    assert parse_event_date(date_str) == expected


@pytest.mark.parametrize(
    "now, expected",
    [
        (datetime(2026, 10, 25, 3, 29, tzinfo=EASTERN_TIME), date(2026, 10, 24)),
        (datetime(2026, 10, 25, 3, 30, tzinfo=EASTERN_TIME), date(2026, 10, 25)),
        # 2am Eastern is 6am UTC, which is still the previous service day
        (datetime(2026, 10, 25, 6, 0, tzinfo=timezone.utc), date(2026, 10, 24)),
    ],
)
def test_current_service_date(now, expected):
    assert current_service_date(now) == expected

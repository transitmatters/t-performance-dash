from datetime import datetime, timedelta, timezone

import pytest

from chalicelib.date_utils import EASTERN_TIME, parse_event_date


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

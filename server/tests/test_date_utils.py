from datetime import datetime, timedelta, timezone

import pytest

from chalicelib.date_utils import EASTERN_TIME, dst_eve_next_day_offset, fix_dst_eve_event_time, parse_event_date


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
    "service_date, expected",
    [
        ("2022-03-11", None),
        ("2022-03-12", timedelta(hours=-4)),  # clocks spring forward on the 13th
        ("2022-03-13", None),
        ("2022-11-05", timedelta(hours=-5)),  # clocks fall back on the 6th
        ("2022-11-06", None),
    ],
)
def test_dst_eve_next_day_offset(service_date, expected):
    assert dst_eve_next_day_offset(service_date) == expected


@pytest.mark.parametrize(
    "event_time, next_day_offset, expected",
    [
        # Harvard predicted arrival from issue #188: an hour late
        ("2022-03-12 08:33:38", timedelta(hours=-4), "2022-03-12 07:33:38"),
        ("2022-03-13 00:31:44", timedelta(hours=-4), "2022-03-12 23:31:44"),
        # After the 2am change the next day's offset was right all along
        ("2023-03-12 03:01:44", timedelta(hours=-4), "2023-03-12 03:01:44"),
        # Before clocks fall back predicted events are an hour early
        ("2022-11-05 08:00:00", timedelta(hours=-5), "2022-11-05 09:00:00"),
        ("2022-11-06 00:40:00", timedelta(hours=-5), "2022-11-06 01:40:00"),
    ],
)
def test_fix_dst_eve_event_time(event_time, next_day_offset, expected):
    assert fix_dst_eve_event_time(event_time, next_day_offset) == expected

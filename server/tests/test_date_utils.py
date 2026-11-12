from datetime import date, datetime, timedelta, timezone

import pytest

from chalicelib.date_utils import (
    EASTERN_TIME,
    current_service_date,
    dst_eve_next_day_offset,
    fix_dst_eve_event_time,
    parse_event_date,
)


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
        (datetime(2026, 10, 25, 2, 59, tzinfo=EASTERN_TIME), date(2026, 10, 24)),
        (datetime(2026, 10, 25, 3, 0, tzinfo=EASTERN_TIME), date(2026, 10, 25)),
        # 2am Eastern is 6am UTC, which is still the previous service day
        (datetime(2026, 10, 25, 6, 0, tzinfo=timezone.utc), date(2026, 10, 24)),
        # 7:30am UTC is 3:30am Eastern, a new service day
        (datetime(2026, 10, 25, 7, 30, tzinfo=timezone.utc), date(2026, 10, 25)),
        # The night clocks fall back: 1:30am EST comes after 1:30am EDT and is still the day before
        (datetime(2026, 11, 1, 1, 30, fold=1, tzinfo=EASTERN_TIME), date(2026, 10, 31)),
        (datetime(2026, 11, 1, 3, 0, tzinfo=EASTERN_TIME), date(2026, 11, 1)),
    ],
)
def test_current_service_date(now, expected):
    assert current_service_date(now) == expected


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

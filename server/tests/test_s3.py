"""Tests for s3.py event source selection."""

from datetime import date

import pytest
from botocore.exceptions import ClientError

from chalicelib import s3

HEADER = "service_date,route_id,trip_id,direction_id,stop_id,event_type,event_time,vehicle_label"


def _csv(*rows):
    return "\n".join([HEADER, *rows])


@pytest.fixture
def fake_s3(monkeypatch):
    """Serve event files from a dict of S3 key -> CSV text, recording requested keys."""
    files, requested = {}, []

    def download(key, encoding="utf8", compressed=True):
        requested.append(key)
        if key not in files:
            raise ClientError({"Error": {"Code": "NoSuchKey"}}, "GetObject")
        return files[key]

    monkeypatch.setattr(s3, "download", download)
    monkeypatch.setattr(s3.date_utils, "MAX_MONTH_DATA_DATE", "2026-06-30")
    monkeypatch.setattr(s3.date_utils, "MAX_FERRY_MONTH_DATA_DATE", "2026-03-31")
    return files, requested


LAMP_KEY = "Events-lamp/daily-data/70061/Year=2025/Month=3/Day=12/events.csv"
MONTHLY_KEY = "Events/monthly-data/70061/Year=2025/Month=3/events.csv.gz"


def test_single_day_rapid_transit_reads_lamp_first(fake_s3):
    files, requested = fake_s3
    files[LAMP_KEY] = _csv("2025-03-12,Red,t1,0,70061,DEP,2025-03-12 05:01:50-04:00,1854")
    files[MONTHLY_KEY] = _csv("2025-03-12,Red,t1,0,70061,DEP,2025-03-12 05:01:50,1854")

    rows = s3.download_events(date(2025, 3, 12), date(2025, 3, 12), ["70061"])

    assert requested == [LAMP_KEY]
    assert rows[0]["event_time"].endswith("-04:00")


def test_single_day_falls_back_to_monthly_when_lamp_missing(fake_s3):
    files, requested = fake_s3
    files[MONTHLY_KEY] = _csv(
        "2025-03-11,Red,t0,0,70061,DEP,2025-03-11 05:00:00,1850",
        "2025-03-12,Red,t1,0,70061,DEP,2025-03-12 05:01:50,1854",
    )

    rows = s3.download_events(date(2025, 3, 12), date(2025, 3, 12), ["70061"])

    assert requested == [LAMP_KEY, MONTHLY_KEY]
    assert [r["trip_id"] for r in rows] == ["t1"]


def test_ranged_requests_still_use_monthly(fake_s3):
    files, requested = fake_s3
    files[MONTHLY_KEY] = _csv("2025-03-12,Red,t1,0,70061,DEP,2025-03-12 05:01:50,1854")

    s3.download_events(date(2025, 3, 10), date(2025, 3, 14), ["70061"])

    assert requested == [MONTHLY_KEY]


def test_single_day_bus_is_unchanged(fake_s3):
    files, requested = fake_s3
    bus_monthly = "Events/monthly-bus-data/1-1-72/Year=2025/Month=3/events.csv.gz"
    files[bus_monthly] = _csv("2025-03-12,1,t1,1,72,DEP,2025-03-12 05:01:50,")

    s3.download_events(date(2025, 3, 12), date(2025, 3, 12), ["1-1-72"])

    assert requested == [bus_monthly]


def test_single_day_after_monthly_cutoff_is_unchanged(fake_s3):
    files, requested = fake_s3
    lamp_recent = "Events-lamp/daily-data/70061/Year=2026/Month=9/Day=9/events.csv"
    files[lamp_recent] = _csv("2026-09-09,Red,t1,0,70061,DEP,2026-09-09 05:01:50-04:00,1854")

    s3.download_events(date(2026, 9, 9), date(2026, 9, 9), ["70061"])

    assert requested == [lamp_recent]


CR_STOP = "CR-Fairmount_0_DB-2205-01"


def _cr_key(day):
    return f"Events-live/daily-cr-data/{CR_STOP}/Year={day.year}/Month={day.month}/Day={day.day}/events.csv.gz"


@pytest.mark.parametrize("day", [date(2024, 6, 12), date(2026, 9, 9)], ids=["before_cutoff", "after_cutoff"])
def test_commuter_rail_always_reads_gobble(fake_s3, day):
    files, requested = fake_s3
    files[_cr_key(day)] = _csv(f"{day},CR-Fairmount,t1,0,DB-2205-01,DEP,{day} 07:01:50,1812")

    rows = s3.download_events(day, day, [CR_STOP])

    assert requested == [_cr_key(day)]
    assert rows[0]["vehicle_label"] == "1812"


def test_commuter_rail_range_before_cutoff_reads_each_day(fake_s3):
    files, requested = fake_s3
    days = [date(2024, 6, 11), date(2024, 6, 12)]
    for day in days:
        files[_cr_key(day)] = _csv(f"{day},CR-Fairmount,t1,0,DB-2205-01,DEP,{day} 07:01:50,1812")

    rows = s3.download_events(days[0], days[1], [CR_STOP])

    assert sorted(requested) == sorted(_cr_key(day) for day in days)
    assert len(rows) == 2


FERRY_STOP = "Boat-F4|0|Boat-Long-South"


def _ferry_monthly_key(day):
    return f"Events/monthly-ferry-data/{FERRY_STOP}/Year={day.year}/Month={day.month}/events.csv.gz"


def _ferry_daily_key(day):
    return f"Events-live/daily-ferry-data/{FERRY_STOP}/Year={day.year}/Month={day.month}/Day={day.day}/events.csv.gz"


def _ferry_row(day):
    return f"{day},Boat-F4,t1,0,Boat-Long-South,DEP,{day} 06:31:18,RITA"


def test_ferry_before_cutoff_reads_monthly(fake_s3):
    files, requested = fake_s3
    day = date(2026, 3, 12)
    files[_ferry_monthly_key(day)] = _csv(_ferry_row(day))

    rows = s3.download_events(day, day, [FERRY_STOP])

    assert requested == [_ferry_monthly_key(day)]
    assert len(rows) == 1


def test_ferry_after_cutoff_reads_gobble(fake_s3):
    files, requested = fake_s3
    day = date(2026, 10, 9)
    files[_ferry_daily_key(day)] = _csv(_ferry_row(day))

    rows = s3.download_events(day, day, [FERRY_STOP])

    assert requested == [_ferry_daily_key(day)]
    assert rows[0]["vehicle_label"] == "RITA"


def test_ferry_range_across_cutoff_reads_monthly_then_daily(fake_s3):
    files, requested = fake_s3
    march, april = [date(2026, 3, 30), date(2026, 3, 31)], [date(2026, 4, 1), date(2026, 4, 2)]
    files[_ferry_monthly_key(march[0])] = _csv(*[_ferry_row(day) for day in march])
    for day in april:
        files[_ferry_daily_key(day)] = _csv(_ferry_row(day))

    rows = s3.download_events(march[0], april[-1], [FERRY_STOP])

    assert sorted(requested) == sorted([_ferry_monthly_key(march[0]), *[_ferry_daily_key(day) for day in april]])
    assert [r["service_date"] for r in rows] == [str(day) for day in march + april]


def test_missing_ferry_day_is_requested_once(fake_s3):
    _, requested = fake_s3
    day = date(2026, 6, 1)

    assert s3.download_events(day, day, [FERRY_STOP]) == []
    assert requested == [_ferry_daily_key(day)]

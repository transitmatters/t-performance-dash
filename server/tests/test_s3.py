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

"""Tests for per-car occupancy passing through s3_historical."""

from datetime import date

import pytest

from chalicelib import s3_historical

DAY = date(2026, 10, 23)


def _event(event_type, event_time, trip_id, **extra):
    return {
        "service_date": "2026-10-23",
        "route_id": "Red",
        "trip_id": trip_id,
        "direction_id": "0",
        "event_type": event_type,
        "event_time": f"2026-10-23 {event_time}-04:00",
        "vehicle_label": "1932",
        "vehicle_consist": "1932|1933|1913",
        **extra,
    }


MIXED = {
    "occupancy_status": "FEW_SEATS_AVAILABLE|NO_DATA_AVAILABLE|STANDING_ROOM_ONLY",
    "occupancy_percentage": "8.0||19.0",
}
BLANK = {"occupancy_status": "", "occupancy_percentage": ""}


@pytest.fixture
def events(monkeypatch):
    """Serve the same event rows for every stop list."""
    rows = []
    monkeypatch.setattr(s3_historical.s3, "download_events", lambda *args, **kwargs: rows)
    # Reads the TM benchmarks archive from S3
    monkeypatch.setattr(s3_historical.tm_benchmarks, "resolve_travel_time_benchmark", lambda *args: None)
    return rows


def _occupancy(record):
    return record["occupancy_status"], record["occupancy_percentage"]


def test_headways_pass_occupancy_through(events):
    # The first departure has blank occupancy, the second reports it, the third predates the columns
    events += [
        _event("DEP", "06:00:00", "t1", **BLANK),
        _event("DEP", "06:05:00", "t2", **MIXED),
        _event("DEP", "06:10:00", "t3"),
    ]

    headways = s3_historical.headways(["70061"], DAY, DAY, single_day=True)

    assert [_occupancy(h) for h in headways] == [
        ("FEW_SEATS_AVAILABLE|NO_DATA_AVAILABLE|STANDING_ROOM_ONLY", "8.0||19.0"),
        (None, None),
    ]


def _departure(route_id, service_date, event_time, trip_id):
    # A full timestamp, since a train after midnight belongs to the previous service date
    return {**_event("DEP", "", trip_id, route_id=route_id, service_date=service_date), "event_time": event_time}


def _headways(events, *departures):
    events += departures
    headways = s3_historical.headways(["stop"], date(2026, 9, 1), date(2026, 9, 30))
    return [(h["current_dep_dt"][11:19], h["headway_time_sec"]) for h in headways]


def test_commuter_rail_headways_skip_the_overnight_gap(events):
    # Commuter Rail is exempt from the 120-minute cutoff, so the 7-hour gap used to count as a headway
    headways = _headways(
        events,
        _departure("CR-Fairmount", "2026-09-05", "2026-09-05 22:40:00-04:00", "t1"),
        _departure("CR-Fairmount", "2026-09-05", "2026-09-06 00:10:00-04:00", "t2"),
        _departure("CR-Fairmount", "2026-09-06", "2026-09-06 07:10:00-04:00", "t3"),
        _departure("CR-Fairmount", "2026-09-06", "2026-09-06 08:40:00-04:00", "t4"),
    )

    assert headways == [("00:10:00", 5400), ("08:40:00", 5400)]


def test_bus_headways_skip_an_overnight_gap_under_two_hours(events):
    # Route 28 runs until about 2 AM and starts again around 3 AM, inside the 120-minute cutoff
    headways = _headways(
        events,
        _departure("28", "2026-09-01", "2026-09-02 01:44:51-04:00", "t1"),
        _departure("28", "2026-09-02", "2026-09-02 03:02:10-04:00", "t2"),
        _departure("28", "2026-09-02", "2026-09-02 03:20:10-04:00", "t3"),
    )

    assert headways == [("03:20:10", 1080)]


def test_dwells_use_the_departure_reading(events):
    events += [
        _event(
            "ARR",
            "06:00:00",
            "t1",
            occupancy_status="MANY_SEATS_AVAILABLE|MANY_SEATS_AVAILABLE|MANY_SEATS_AVAILABLE",
            occupancy_percentage="1.0|2.0|3.0",
        ),
        _event("DEP", "06:01:00", "t1", **MIXED),
    ]

    [dwell] = s3_historical.dwells(["70063"], DAY, DAY, single_day=True)

    assert _occupancy(dwell) == (MIXED["occupancy_status"], MIXED["occupancy_percentage"])


def test_travel_times_use_the_origin_departure_reading(events):
    # The stub serves both stop lists, so t1's DEP pairs with its own later ARR
    events += [
        _event("DEP", "06:00:00", "t1", **MIXED),
        _event("ARR", "06:04:00", "t1", **BLANK),
        _event("DEP", "06:10:00", "t2", **BLANK),
        _event("ARR", "06:14:00", "t2", **MIXED),
    ]

    travel_times = s3_historical.travel_times(["70061"], ["70063"], DAY, DAY, single_day=True)

    assert [_occupancy(t) for t in travel_times] == [
        (MIXED["occupancy_status"], MIXED["occupancy_percentage"]),
        (None, None),
    ]

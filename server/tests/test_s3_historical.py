"""Tests for dwell calculation in s3_historical.py.

Each scenario is modeled on events seen in the real S3 data.
"""

from datetime import date

import pytest

from chalicelib import s3_historical

DAY = date(2026, 5, 1)


def _event(event_type, time, trip_id, stop_id="70154", vehicle="3600-3800"):
    return {
        "service_date": "2026-05-01",
        "route_id": "Green-B",
        "trip_id": trip_id,
        "direction_id": "0",
        "stop_id": stop_id,
        "event_type": event_type,
        "event_time": f"2026-05-01 {time}",
        "vehicle_label": vehicle,
    }


@pytest.fixture
def events(monkeypatch):
    """Serve the given events from download_events, sorted by time like the real thing."""
    served = []
    monkeypatch.setattr(
        s3_historical.s3,
        "download_events",
        lambda start, end, stops: sorted(served, key=lambda row: row["event_time"]),
    )
    return served


def _dwells(events, *rows):
    events.extend(rows)
    return [(d["arr_dt"][11:19], d["dep_dt"][11:19], d["dwell_time_sec"]) for d in s3_historical.dwells([], DAY, DAY)]


def test_simple_dwell(events):
    dwells = _dwells(events, _event("ARR", "06:15:45", "t1"), _event("DEP", "06:16:28", "t1"))

    assert dwells == [("06:15:45", "06:16:28", 43)]


def test_overlapping_trains_both_get_dwells(events):
    # Copley, 2026-05-01: a second train arrives before the first has left
    dwells = _dwells(
        events,
        _event("ARR", "06:17:35", "t1"),
        _event("ARR", "06:18:29", "t2"),
        _event("DEP", "06:18:33", "t1"),
        _event("DEP", "06:19:17", "t2"),
    )

    assert dwells == [("06:17:35", "06:18:33", 58), ("06:18:29", "06:19:17", 48)]


def test_train_recorded_at_two_platforms(events):
    # Park St westbound, 2026-05-03: one train shows up at two berths
    dwells = _dwells(
        events,
        _event("ARR", "18:52:46", "t1", stop_id="70197"),
        _event("ARR", "18:52:52", "t1", stop_id="70198"),
        _event("DEP", "18:53:56", "t1", stop_id="70197"),
    )

    assert dwells == [("18:52:46", "18:53:56", 70)]


def test_quick_rearrival_is_one_stop(events):
    # Tufts northbound, 2019-10-01: departs, arrives again 4s later, departs again
    dwells = _dwells(
        events,
        _event("ARR", "09:20:46", "t1"),
        _event("DEP", "09:21:32", "t1"),
        _event("ARR", "09:21:36", "t1"),
        _event("ARR", "09:21:57", "t2"),
        _event("DEP", "09:22:11", "t1"),
        _event("DEP", "09:22:24", "t2"),
    )

    assert dwells == [("09:20:46", "09:22:11", 85), ("09:21:57", "09:22:24", 27)]


def test_quick_rearrival_without_departure_keeps_first_departure(events):
    dwells = _dwells(
        events,
        _event("ARR", "09:20:46", "t1"),
        _event("DEP", "09:21:32", "t1"),
        _event("ARR", "09:21:36", "t1"),
    )

    assert dwells == [("09:20:46", "09:21:32", 46)]


def test_trip_id_reused_later_in_the_day_is_a_new_stop(events):
    # Gov Ctr westbound, 2026-10-13: the same trip_id comes through two hours later
    dwells = _dwells(
        events,
        _event("ARR", "14:42:33", "t1"),
        _event("DEP", "14:42:52", "t1"),
        _event("ARR", "16:45:06", "t1"),
        _event("DEP", "16:45:25", "t1"),
    )

    assert dwells == [("14:42:33", "14:42:52", 19), ("16:45:06", "16:45:25", 19)]


def test_second_departure_without_rearrival_is_ignored(events):
    # Park St westbound, 2026-10-14: LAMP also ends this dwell at the first departure
    dwells = _dwells(
        events,
        _event("ARR", "22:33:08", "t1"),
        _event("DEP", "22:44:18", "t1"),
        _event("DEP", "22:44:25", "t1"),
    )

    assert dwells == [("22:33:08", "22:44:18", 670)]


def test_departure_before_arrival_is_not_a_dwell(events):
    dwells = _dwells(events, _event("DEP", "12:40:21", "t1"), _event("ARR", "12:47:40", "t1"))

    assert dwells == []


def test_empty_trip_ids_are_not_matched(events):
    dwells = _dwells(events, _event("ARR", "06:00:00", "", vehicle="a"), _event("DEP", "06:05:00", "", vehicle="b"))

    assert dwells == []


def test_dwell_record_fields(events):
    events.extend([_event("ARR", "06:15:45", "t1"), _event("DEP", "06:16:28", "t1")])

    (dwell,) = s3_historical.dwells([], DAY, DAY)

    assert dwell == {
        "route_id": "Green-B",
        "direction": 0,
        "arr_dt": "2026-05-01T06:15:45",
        "dep_dt": "2026-05-01T06:16:28",
        "dwell_time_sec": 43.0,
        "vehicle_consist": None,
        "vehicle_label": "3600-3800",
    }

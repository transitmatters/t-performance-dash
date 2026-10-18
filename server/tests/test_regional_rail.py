from datetime import date

import pytest

from chalicelib import regional_rail


def direction(trips, hours_at_target, midday_gap, clock_face=None, by_hour=None):
    return {
        "trips": trips,
        "firstTrip": 6 * 3600,
        "lastTrip": 23 * 3600,
        "maxGapMidday": midday_gap,
        "maxGapEvening": 120,
        "hoursAtTarget": hours_at_target,
        "clockFaceShare": clock_face,
        "byHour": by_hour or [0] * 24,
    }


def row(route, day, outbound, inbound, peak=10, reverse_peak=4):
    return {
        "routeId": route,
        "lineId": f"line-{route}",
        "date": day,
        "timestamp": 0,
        "hasServiceExceptions": False,
        "outbound": outbound,
        "inbound": inbound,
        "peakTrips": peak,
        "reversePeakTrips": reverse_peak,
    }


@pytest.mark.parametrize("day, kind", [("2026-10-09", "weekday"), ("2026-10-10", "saturday"), ("2026-10-11", "sunday")])
def test_day_kind(day, kind):
    assert regional_rail.day_kind(date.fromisoformat(day)) == kind


def test_daily_keeps_metrics_and_drops_keys():
    [entry] = regional_rail.aggregate(
        [row("CR-Worcester", "2026-10-08", direction(20, 2, 120), direction(21, 3, 90))], "daily"
    )
    assert entry["date"] == "2026-10-08"
    assert entry["days"] == 1
    assert entry["outbound"]["trips"] == 20
    assert entry["inbound"]["maxGapMidday"] == 90
    assert "routeId" not in entry and "hasServiceExceptions" not in entry


def test_weekly_averages_days_and_hours():
    hourly = lambda n: [n] * 24  # noqa: E731
    items = [
        row("CR-Fairmount", "2026-10-06", direction(30, 10, 60, 0.5, hourly(1)), direction(30, 10, 60), peak=12),
        row("CR-Fairmount", "2026-10-07", direction(40, 20, 30, None, hourly(3)), direction(40, 20, 30), peak=8),
    ]
    [entry] = regional_rail.aggregate(items, "weekly")
    assert entry["date"] == "2026-10-05"
    assert entry["days"] == 2
    assert entry["outbound"]["trips"] == 35
    assert entry["outbound"]["hoursAtTarget"] == 15
    # A day without enough trains for a clock-face share doesn't count as 0
    assert entry["outbound"]["clockFaceShare"] == 0.5
    assert entry["outbound"]["byHour"] == [2] * 24
    assert entry["peakTrips"] == 10


def test_scorecard_only_includes_the_requested_kind_of_day(monkeypatch):
    items = [
        row("CR-Worcester", "2026-10-09", direction(20, 2, 120), direction(20, 2, 120)),  # Friday
        row("CR-Worcester", "2026-10-10", direction(10, 0, 300), direction(10, 0, 300)),  # Saturday
    ]
    monkeypatch.setattr(regional_rail, "query_regional_rail_scorecard", lambda route, start, end: items)
    [saturday] = regional_rail.get_scorecard(
        "CR-Worcester", date(2026, 10, 1), date(2026, 10, 31), "monthly", "saturday"
    )
    assert saturday["days"] == 1
    assert saturday["outbound"]["maxGapMidday"] == 300


def test_all_lines_summarizes_each_route_with_data(monkeypatch):
    rows = {
        "CR-Fairmount": [row("CR-Fairmount", "2026-10-09", direction(30, 12, 60), direction(30, 12, 60))],
        "CR-Worcester": [row("CR-Worcester", "2026-10-09", direction(20, 2, 120), direction(20, 2, 120))],
    }
    monkeypatch.setattr(regional_rail, "query_regional_rail_scorecard", lambda route, start, end: rows.get(route, []))
    summaries = regional_rail.get_scorecard("commuter-rail", date(2026, 10, 1), date(2026, 10, 31), "daily", "weekday")
    assert [s["routeId"] for s in summaries] == ["CR-Fairmount", "CR-Worcester"]
    assert summaries[0]["days"] == 1
    assert summaries[1]["outbound"]["hoursAtTarget"] == 2


def test_all_days_mixes_schedules(monkeypatch):
    items = [
        row("CR-Worcester", "2026-10-09", direction(20, 2, 120), direction(20, 2, 120)),  # Friday
        row("CR-Worcester", "2026-10-10", direction(10, 0, 300), direction(10, 0, 300)),  # Saturday
    ]
    monkeypatch.setattr(regional_rail, "query_regional_rail_scorecard", lambda route, start, end: items)
    days = regional_rail.get_scorecard("CR-Worcester", date(2026, 10, 1), date(2026, 10, 31), "daily", "all")
    assert [(d["date"], d["outbound"]["trips"]) for d in days] == [("2026-10-09", 20), ("2026-10-10", 10)]

import pytest

from chalicelib import reliability


def ride(day, completed, on_time, **extra):
    return {"routeId": "RIDE", "date": day, "timestamp": 0, "mode": "the-ride", "source": "current",
            "completed": completed, "onTime": on_time, "otp": 95.0, **extra}  # fmt: skip


def cr(route, day, num, den, cancelled, peak=(0, 0, 0)):
    counts = lambda n, d, c: {"otpNumerator": n, "otpDenominator": d, "cancelled": c}  # noqa: E731
    return {
        "routeId": route,
        "date": day,
        "timestamp": 0,
        "mode": "commuter-rail",
        **counts(num, den, cancelled),
        "peak": counts(*peak),
        "offPeak": counts(num - peak[0], den - peak[1], cancelled - peak[2]),
    }


def test_bucket_start():
    from datetime import date

    assert reliability.bucket_start(date(2026, 1, 8), "weekly") == date(2026, 1, 5)
    assert reliability.bucket_start(date(2026, 1, 8), "monthly") == date(2026, 1, 1)
    assert reliability.bucket_start(date(2026, 1, 8), "daily") == date(2026, 1, 8)


def test_daily_drops_non_count_fields():
    [entry] = reliability.aggregate([ride("2026-01-08", 10, 9, noShows=1)], "daily")
    assert entry == {"date": "2026-01-08", "days": 1, "completed": 10, "onTime": 9, "noShows": 1}


def test_weekly_only_keeps_fields_recorded_every_day():
    items = [ride("2026-01-06", 10, 9, requests=12), ride("2026-01-07", 20, 18, requests=25, noShows=2)]
    [entry] = reliability.aggregate(items, "weekly")
    assert entry == {"date": "2026-01-05", "days": 2, "completed": 30, "onTime": 27, "requests": 37}


def test_commuter_rail_routes_sum_per_day_and_nested_periods():
    items = [
        cr("CR-Worcester", "2026-06-01", 8, 10, 1, peak=(3, 4, 1)),
        cr("CR-Lowell", "2026-06-01", 5, 5, 0),
        cr("CR-Lowell", "2026-06-02", 4, 6, 2, peak=(1, 2, 0)),
    ]
    [entry] = reliability.aggregate(items, "monthly")
    assert entry["days"] == 2
    assert (entry["otpNumerator"], entry["otpDenominator"], entry["cancelled"]) == (17, 21, 3)
    assert entry["peak"] == {"otpNumerator": 4, "otpDenominator": 6, "cancelled": 1}
    assert entry["offPeak"] == {"otpNumerator": 13, "otpDenominator": 15, "cancelled": 2}


def test_get_reliability_queries_every_cr_route(monkeypatch):
    queried = []
    monkeypatch.setattr(reliability, "query_reliability", lambda rid, s, e: queried.append(rid) or [])
    from datetime import date

    assert reliability.get_reliability("commuter-rail", date(2026, 1, 1), date(2026, 2, 1), "weekly") == []
    assert queried == reliability.COMMUTER_RAIL_ROUTES


def subway(day, within, bunched, by_direction=None):
    counts = {"headways_under_50": bunched, "headways_50_75": 0, "headways_75_125": within, "headways_125_150": 0,
              "headways_over_150": 0}  # fmt: skip
    return {"route": "line-red", "date": day, "source": "lamp", **counts, "byDirection": by_direction or {"0": counts}}


def test_subway_lines_read_headway_counts_and_sum_directions(monkeypatch):
    from datetime import date

    queried = []
    items = [
        subway("2026-11-02", 60, 5),
        subway("2026-11-03", 40, 15, {"0": {"headways_75_125": 40}, "1": {"headways_under_50": 15}}),
    ]
    monkeypatch.setattr(reliability, "query_headway_reliability", lambda r, s, e: queried.append(r) or items)
    monkeypatch.setattr(reliability, "query_reliability", lambda *args: pytest.fail("wrong table"))

    [entry] = reliability.get_reliability("line-red", date(2026, 11, 2), date(2026, 11, 8), "weekly")
    assert queried == ["line-red"]
    assert entry["date"] == "2026-11-02"
    assert entry["days"] == 2
    assert (entry["headways_75_125"], entry["headways_under_50"]) == (100, 20)
    assert "route" not in entry and "source" not in entry
    # Direction "1" is missing on one day, so it's left out rather than reported as a partial total.
    assert entry["byDirection"] == {"0": {"headways_75_125": 100}}


def bus(route, day, bunched, on_time, **extra):
    counts = {"headways_under_50": bunched, "headways_50_75": 1, "headways_75_125": on_time, "headways_125_150": 1,
              "headways_over_150": 2}  # fmt: skip
    return {"route": route, "date": day, "count": 100, "fleet_trips": 90, "day_type": "business_day", **counts, **extra}


def test_bus_routes_sum_headway_counts_and_skip_rows_without_them(monkeypatch):
    from datetime import date

    queried = []

    def query(table, routes, start, end):
        queried.append((table, list(routes), start, end))
        return [
            # Fleet-only row from before LAMP bus data: not a day with headway data
            [{"route": "114", "date": "2025-12-22", "fleet_trips": 50}, bus("114", "2025-12-24", 3, 10)],
            [bus("116", "2025-12-24", 5, 20, time_bands={"am_peak": {"count": 4}})],
        ]

    monkeypatch.setattr(reliability, "query_daily_trips_on_routes", query)
    monkeypatch.setattr(reliability, "query_reliability", lambda *args: pytest.fail("wrong table"))

    [entry] = reliability.get_reliability("114,116", date(2025, 12, 22), date(2025, 12, 28), "weekly")
    assert queried == [("DeliveredTripMetricsBus", ["114", "116"], "2025-12-22", "2025-12-28")]
    assert entry == {
        "date": "2025-12-22",
        "days": 1,
        "headways_under_50": 8,
        "headways_50_75": 2,
        "headways_75_125": 30,
        "headways_125_150": 2,
        "headways_over_150": 4,
    }


def test_bus_route_ids_only_match_raw_gtfs_ids():
    assert reliability.bus_route_ids("28") == ["28"]
    assert reliability.bus_route_ids("114, 116,117") == ["114", "116", "117"]
    assert reliability.bus_route_ids("34E") == ["34E"]
    for not_bus in ("RIDE", "CR-Worcester", "commuter-rail", "line-red", "", "28,line-red"):
        assert reliability.bus_route_ids(not_bus) is None

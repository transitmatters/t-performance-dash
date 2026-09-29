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

"""Tests for speed.py trip metrics aggregation."""

from chalicelib.speed import aggregate_actual_trips


def _row(route, date, **fleet):
    return {
        "route": route,
        "date": date,
        "line": "line-red",
        "miles_covered": 10.0,
        "total_time": 5.0,
        "count": 2.0,
        **fleet,
    }


def test_fleet_fields_survive_branch_merge():
    fleet = {"avg_car_age": 24.5, "pct_new_trips": 40.2, "fleet_mix_red1": 4.1, "fleet_mix_red4": 95.9}
    trips = [[_row("line-red-a", "2026-09-21", **fleet)], [_row("line-red-b", "2026-09-21", **fleet)]]

    [record] = aggregate_actual_trips(trips, "daily", "2026-09-21")

    assert record["fleet_mix_red1"] == 4.1
    assert record["fleet_mix_red4"] == 95.9
    assert record["avg_car_age"] == 24.5
    assert record["miles_covered"] == 20.0


def test_days_without_fleet_data_omit_fleet_fields():
    trips = [
        [_row("line-red-a", "2026-09-20"), _row("line-red-a", "2026-09-21", avg_car_age=24.5, fleet_mix_red4=95.9)],
        [_row("line-red-b", "2026-09-20"), _row("line-red-b", "2026-09-21", avg_car_age=24.5, fleet_mix_red4=95.9)],
    ]

    no_data, has_data = aggregate_actual_trips(trips, "daily", "2026-09-20")

    assert "avg_car_age" not in no_data and "fleet_mix_red4" not in no_data
    assert has_data["fleet_mix_red4"] == 95.9

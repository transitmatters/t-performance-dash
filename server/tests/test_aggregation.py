import datetime

import pytest

from chalicelib import aggregation, data_funcs

DAY = datetime.date(2025, 7, 15)


def _headways(n):
    return [
        {
            "current_dep_dt": f"2025-07-15T{8 + i:02d}:00:00",
            "headway_time_sec": 3600,
            "benchmark_headway_time_sec": 3600,
        }
        for i in range(n)
    ]


@pytest.mark.parametrize(
    ("stop", "expected_days"),
    [
        ("Boat-Lynn|1|Boat-Blossom", 1),
        ("70061", 0),
    ],
)
def test_headways_keep_low_frequency_ferry_days(monkeypatch, stop, expected_days):
    monkeypatch.setattr(data_funcs, "headways", lambda *_args: _headways(3))

    result = aggregation.headways_over_time(DAY, DAY, [stop])

    assert len(result) == expected_days
    if expected_days:
        assert result[0]["count"] == 3


def test_headways_count_scheduled_headways(monkeypatch):
    # Scheduled every 10 minutes: one bunched (4 min), two on time (10, 11 min), two with no schedule
    records = [
        {"current_dep_dt": f"2025-07-15T08:{i:02d}:00", "headway_time_sec": sec, "benchmark_headway_time_sec": bench}
        for i, (sec, bench) in enumerate([(240, 600), (600, 600), (660, 600), (600, None), (300, None)])
    ]
    monkeypatch.setattr(data_funcs, "headways", lambda *_args: records)

    [day] = aggregation.headways_over_time(DAY, DAY, ["70061"])

    assert (day["count"], day["scheduled"], day["bunched"], day["on_time"]) == (5, 3, 1, 2)


def test_travel_times_keep_low_frequency_ferry_days(monkeypatch):
    records = [
        {"dep_dt": f"2025-07-15T{8 + i:02d}:00:00", "travel_time_sec": 1800, "route_id": "Boat-Lynn"} for i in range(3)
    ]
    monkeypatch.setattr(data_funcs, "travel_times", lambda *_args: records)

    result = aggregation.travel_times_all(DAY, DAY, ["Boat-Lynn|1|Boat-Blossom"], ["Boat-Lynn|1|Boat-Long"])

    assert [r["count"] for r in result["by_date"] if r["peak"] == "all"] == [3]
    assert result["by_time"]

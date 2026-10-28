"""Tests for delays.py — line validation and summing bus routes."""

import pytest
from chalice import BadRequestError

from chalicelib import delays

PARAMS = {"start_date": "2026-10-19", "end_date": "2026-10-21", "agg": "daily"}

# Only "Bus" has a row every day; routes only have rows on days with a delay
ROWS = {
    "Bus": [
        {"line": "Bus", "date": "2026-10-19", "total_delay_time": 90, "car_traffic": 70, "delay_alert_minutes": 200},
        {"line": "Bus", "date": "2026-10-20", "total_delay_time": 0, "car_traffic": 0, "delay_alert_minutes": 0},
        {"line": "Bus", "date": "2026-10-21", "total_delay_time": 40, "car_traffic": 40, "delay_alert_minutes": 60},
    ],
    "114": [
        {"line": "114", "date": "2026-10-19", "total_delay_time": 20, "car_traffic": 20, "delay_alert_minutes": 45}
    ],
    "116": [
        {"line": "116", "date": "2026-10-19", "total_delay_time": 25, "car_traffic": 0, "delay_alert_minutes": 30},
        {"line": "116", "date": "2026-10-21", "total_delay_time": 20, "car_traffic": 20, "delay_alert_minutes": 25},
    ],
    "Red": [{"line": "Red", "date": "2026-10-19", "total_delay_time": 10}],
}


@pytest.fixture
def queried(monkeypatch):
    lines = []

    def fake_query(start_date, end_date, table_name, line):
        lines.append(line)
        return [dict(row) for row in ROWS.get(line, [])]

    monkeypatch.setattr(delays.dynamo, "query_agg_trip_metrics", fake_query)
    return lines


def test_rail_line_queries_one_line(queried):
    assert delays.delay_time_by_line({**PARAMS, "line": "Red"}) == ROWS["Red"]
    assert queried == ["Red"]


def test_bus_aggregate(queried):
    assert delays.delay_time_by_line({**PARAMS, "line": "Bus"}) == ROWS["Bus"]


def test_grouped_bus_routes_are_summed_and_zero_filled(queried):
    result = delays.delay_time_by_line({**PARAMS, "line": "114,116,117"})
    assert [row["date"] for row in result] == ["2026-10-19", "2026-10-20", "2026-10-21"]
    assert [row["total_delay_time"] for row in result] == [45, 0, 20]
    assert [row["car_traffic"] for row in result] == [20, 0, 20]
    assert [row["delay_alert_minutes"] for row in result] == [75, 0, 25]
    assert {row["line"] for row in result} == {"114,116,117"}


@pytest.mark.parametrize("line", ["Purple", "", "1,Red", "Bus,1", "CR-Lowell,1", "1; drop"])
def test_invalid_lines(queried, line):
    with pytest.raises(BadRequestError):
        delays.delay_time_by_line({**PARAMS, "line": line})

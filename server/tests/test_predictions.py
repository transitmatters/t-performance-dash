"""Tests for the optional week range on time predictions."""

from datetime import date

import pytest
from boto3.dynamodb.conditions import Key

from chalicelib import predictions, static_data

WEEKS = [{"routeId": "Red", "week": w, "prediction": []} for w in ("2026-09-07", "2026-09-14", "2026-09-21")]


ROUTE = Key("routeId").eq("Red")


@pytest.fixture
def key_conditions(monkeypatch):
    """Record the key condition each query sends to the TimePredictions table."""
    sent = []

    class FakeTable:
        def query(self, KeyConditionExpression):
            sent.append(KeyConditionExpression)
            return {"Items": []}

    monkeypatch.setattr(predictions, "TimePredictions", FakeTable())
    return sent


def test_no_range_queries_whole_route(key_conditions):
    predictions.query_time_predictions("Red")
    assert key_conditions == [ROUTE]


def test_both_dates_use_between(key_conditions):
    predictions.query_time_predictions("Red", date(2026, 9, 1), date(2026, 9, 30))
    assert key_conditions == [ROUTE & Key("week").between("2026-09-01", "2026-09-30")]


def test_start_only_uses_gte(key_conditions):
    predictions.query_time_predictions("Red", start_date=date(2026, 9, 1))
    assert key_conditions == [ROUTE & Key("week").gte("2026-09-01")]


def test_end_only_uses_lte(key_conditions):
    predictions.query_time_predictions("Red", end_date=date(2026, 9, 30))
    assert key_conditions == [ROUTE & Key("week").lte("2026-09-30")]


@pytest.mark.parametrize(
    "params, expected",
    [
        ({}, ["2026-09-07", "2026-09-14", "2026-09-21"]),
        ({"start_date": "2026-09-14"}, ["2026-09-14", "2026-09-21"]),
        ({"end_date": "2026-09-14"}, ["2026-09-07", "2026-09-14"]),
        ({"start_date": "2026-09-08", "end_date": "2026-09-20"}, ["2026-09-14"]),
    ],
)
def test_static_data_filters_on_week(monkeypatch, params, expected):
    monkeypatch.setattr(static_data, "_load_static_json", lambda path: WEEKS)
    result = static_data.get_time_predictions({"route_id": "Red", **params})
    assert [w["week"] for w in result] == expected

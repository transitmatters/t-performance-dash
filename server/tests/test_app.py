"""Tests for app.py — error handling, input validation, and graceful failures."""

import json
from datetime import date

import pytest
from chalice import BadRequestError
from chalice.test import Client

import app as chalice_app
from app import parse_user_date, validate_query_params


# ---------------------------------------------------------------------------
# Unit tests: parse_user_date
# ---------------------------------------------------------------------------


class TestParseUserDate:
    def test_valid_date(self):
        assert parse_user_date("2024-01-15") == date(2024, 1, 15)

    def test_valid_date_year_boundary(self):
        assert parse_user_date("2020-11-07") == date(2020, 11, 7)

    def test_non_numeric_raises_400(self):
        with pytest.raises(BadRequestError, match="YYYY-MM-DD"):
            parse_user_date("not-a-date")

    def test_partial_date_raises_400(self):
        with pytest.raises(BadRequestError, match="YYYY-MM-DD"):
            parse_user_date("2024-01")

    def test_invalid_month_raises_400(self):
        with pytest.raises(BadRequestError, match="YYYY-MM-DD"):
            parse_user_date("2024-13-01")

    def test_invalid_day_raises_400(self):
        with pytest.raises(BadRequestError, match="YYYY-MM-DD"):
            parse_user_date("2024-01-99")

    def test_bad_value_included_in_message(self):
        with pytest.raises(BadRequestError, match="bad-input"):
            parse_user_date("bad-input")


# ---------------------------------------------------------------------------
# Unit tests: validate_query_params
# ---------------------------------------------------------------------------


class TestValidateQueryParams:
    def test_all_required_present(self):
        validate_query_params({"start_date": "2024-01-01", "end_date": "2024-01-31"}, ["start_date", "end_date"])

    def test_extra_params_ignored(self):
        validate_query_params({"start_date": "x", "end_date": "y", "stop": "70001"}, ["start_date", "end_date"])

    def test_no_required_params(self):
        validate_query_params({}, [])

    def test_none_params_with_required_raises_400(self):
        with pytest.raises(BadRequestError, match="route_id"):
            validate_query_params(None, ["route_id"])

    def test_missing_one_param_raises_400(self):
        with pytest.raises(BadRequestError, match="end_date"):
            validate_query_params({"start_date": "2024-01-01"}, ["start_date", "end_date"])

    def test_missing_all_params_raises_400(self):
        with pytest.raises(BadRequestError, match="start_date"):
            validate_query_params({}, ["start_date", "end_date"])

    def test_missing_params_all_listed_in_message(self):
        with pytest.raises(BadRequestError) as exc_info:
            validate_query_params({}, ["start_date", "end_date", "agg"])
        msg = str(exc_info.value)
        assert "start_date" in msg
        assert "end_date" in msg
        assert "agg" in msg


# ---------------------------------------------------------------------------
# Integration tests: routes return 400 when required params are missing
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def client():
    with Client(chalice_app.app) as c:
        yield c


class TestAggregateTravelTimesValidation:
    def test_missing_both_dates_returns_400(self, client):
        result = client.http.get("/api/aggregate/traveltimes")
        assert result.status_code == 400

    def test_missing_end_date_returns_400(self, client):
        result = client.http.get("/api/aggregate/traveltimes?start_date=2024-01-01")
        assert result.status_code == 400

    def test_missing_start_date_returns_400(self, client):
        result = client.http.get("/api/aggregate/traveltimes?end_date=2024-01-31")
        assert result.status_code == 400

    def test_error_body_mentions_missing_param(self, client):
        result = client.http.get("/api/aggregate/traveltimes")
        body = json.loads(result.body)
        assert "end_date" in body["Message"] or "start_date" in body["Message"]


class TestAggregateTravelTimes2Validation:
    def test_missing_dates_returns_400(self, client):
        result = client.http.get("/api/aggregate/traveltimes2")
        assert result.status_code == 400


class TestAggregateHeadwaysValidation:
    def test_missing_dates_returns_400(self, client):
        result = client.http.get("/api/aggregate/headways")
        assert result.status_code == 400

    def test_missing_start_date_returns_400(self, client):
        result = client.http.get("/api/aggregate/headways?end_date=2024-01-31")
        assert result.status_code == 400


class TestAggregateDwellsValidation:
    def test_missing_dates_returns_400(self, client):
        result = client.http.get("/api/aggregate/dwells")
        assert result.status_code == 400


class TestScheduledServiceValidation:
    def test_missing_all_returns_400(self, client):
        result = client.http.get("/api/scheduledservice")
        assert result.status_code == 400

    def test_missing_agg_returns_400(self, client):
        result = client.http.get("/api/scheduledservice?start_date=2024-01-01&end_date=2024-01-31")
        assert result.status_code == 400

    def test_missing_dates_returns_400(self, client):
        result = client.http.get("/api/scheduledservice?agg=daily")
        assert result.status_code == 400


class TestRidershipValidation:
    def test_missing_dates_returns_400(self, client):
        result = client.http.get("/api/ridership")
        assert result.status_code == 400

    def test_missing_end_date_returns_400(self, client):
        result = client.http.get("/api/ridership?start_date=2024-01-01")
        assert result.status_code == 400


class TestSpeedRestrictionsValidation:
    def test_missing_both_returns_400(self, client):
        result = client.http.get("/api/speed_restrictions")
        assert result.status_code == 400

    def test_missing_line_id_returns_400(self, client):
        result = client.http.get("/api/speed_restrictions?date=2024-01-01")
        assert result.status_code == 400

    def test_missing_date_returns_400(self, client):
        result = client.http.get("/api/speed_restrictions?line_id=Red")
        assert result.status_code == 400


class TestServiceHoursValidation:
    def test_missing_all_returns_400(self, client):
        result = client.http.get("/api/service_hours")
        assert result.status_code == 400

    def test_missing_agg_returns_400(self, client):
        result = client.http.get("/api/service_hours?start_date=2024-01-01&end_date=2024-01-31")
        assert result.status_code == 400


class TestTimePredictionsValidation:
    def test_missing_route_id_returns_400(self, client):
        result = client.http.get("/api/time_predictions")
        assert result.status_code == 400


# ---------------------------------------------------------------------------
# Smoke tests: routes that work without AWS (static/no-param)
# ---------------------------------------------------------------------------


class TestHappyPaths:
    def test_routes_returns_200(self, client):
        result = client.http.get("/api/routes")
        assert result.status_code == 200

    def test_routes_response_has_expected_keys(self, client):
        result = client.http.get("/api/routes")
        body = json.loads(result.body)
        assert "rapid_transit" in body
        assert "bus" in body

    def test_stops_known_route_returns_200(self, client):
        result = client.http.get("/api/stops/Red")
        assert result.status_code == 200

    def test_stops_unknown_route_returns_404(self, client):
        result = client.http.get("/api/stops/not-a-real-route")
        assert result.status_code == 404

    def test_stops_404_body_mentions_route(self, client):
        result = client.http.get("/api/stops/made-up-route")
        body = json.loads(result.body)
        assert "made-up-route" in body["error"]

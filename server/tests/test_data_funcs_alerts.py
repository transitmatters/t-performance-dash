"""Tests for data_funcs.alerts — v2/LAMP/v3 dispatch and flattening."""

from datetime import date
from unittest import mock

from botocore.exceptions import ClientError

from chalicelib import data_funcs


def _no_such_key_error(operation="GetObject"):
    return ClientError({"Error": {"Code": "NoSuchKey", "Message": "not found"}}, operation)


class TestAlertsDispatch:
    def test_before_v2_coverage_returns_none(self):
        assert data_funcs.alerts(date(2016, 1, 1), {}) is None

    def test_v2_range_uses_get_v2_alerts(self):
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_v2_alerts", return_value=[]) as mock_v2:
            with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts") as mock_lamp:
                data_funcs.alerts(date(2019, 8, 31), {})
        mock_v2.assert_called_once()
        mock_lamp.assert_not_called()

    def test_lamp_range_uses_get_lamp_alerts(self):
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts", return_value=[]) as mock_lamp:
            with mock.patch("chalicelib.data_funcs.s3_alerts.get_v2_alerts") as mock_v2:
                data_funcs.alerts(date(2019, 9, 1), {})
        mock_lamp.assert_called_once()
        mock_v2.assert_not_called()

    def test_lamp_range_falls_back_to_v3_when_lamp_key_missing(self):
        # e.g. today, before the daily LAMP rebuild has run yet.
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts", side_effect=_no_such_key_error()):
            with mock.patch("chalicelib.data_funcs.s3_alerts.get_v3_alerts", return_value=[]) as mock_v3:
                result = data_funcs.alerts(date.today(), {})
        mock_v3.assert_called_once()
        assert result == []

    def test_lamp_range_reraises_non_missing_key_errors(self):
        other_error = ClientError({"Error": {"Code": "AccessDenied", "Message": "nope"}}, "GetObject")
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts", side_effect=other_error):
            # alerts() wraps everything in a bare except and returns None -- so the
            # important thing is that it does NOT silently fall back to v3.
            with mock.patch("chalicelib.data_funcs.s3_alerts.get_v3_alerts") as mock_v3:
                result = data_funcs.alerts(date.today(), {})
        mock_v3.assert_not_called()
        assert result is None

    def test_v2_lamp_boundary_is_half_open(self):
        # 2019-08-31 is v2's last day; 2019-09-01 is LAMP's first. Neither source
        # should be asked to cover the other's day.
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_v2_alerts", return_value=[]) as mock_v2:
            with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts") as mock_lamp:
                data_funcs.alerts(date(2019, 9, 1), {})
        mock_v2.assert_not_called()
        mock_lamp.assert_called()


class TestAlertsFlattening:
    def test_lamp_shaped_alert_flattens_like_v3(self):
        # LAMP-derived alerts are v3-JSON:API-shaped, so they should hit the same
        # "attributes" branch and produce the same {valid_from, valid_to, text} shape.
        alert = {
            "id": "1",
            "attributes": {
                "effect": "DELAY",
                "header": "Red Line delays",
                "short_header": None,
                "active_period": [{"start": "2026-01-01T00:00:00-05:00", "end": "2026-01-01T01:00:00-05:00"}],
            },
        }
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts", return_value=[alert]):
            result = data_funcs.alerts(date(2026, 1, 1), {})
        assert result == [
            {
                "valid_from": "2026-01-01T00:00:00-05:00",
                "valid_to": "2026-01-01T01:00:00-05:00",
                "text": "Red Line delays",
            }
        ]

    def test_non_delay_effect_is_excluded(self):
        alert = {
            "id": "1",
            "attributes": {
                "effect": "ELEVATOR_CLOSURE",
                "header": "Elevator unavailable",
                "short_header": None,
                "active_period": [{"start": "2026-01-01T00:00:00-05:00", "end": None}],
            },
        }
        with mock.patch("chalicelib.data_funcs.s3_alerts.get_lamp_alerts", return_value=[alert]):
            result = data_funcs.alerts(date(2026, 1, 1), {})
        assert result == []

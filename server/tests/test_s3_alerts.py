"""Tests for s3_alerts.py — key construction and route filtering."""

from datetime import date
from unittest import mock

from chalicelib import s3_alerts


class TestKeys:
    def test_v2_key(self):
        assert s3_alerts.key(date(2020, 1, 1)) == "Alerts/2020-01-01.json.gz"

    def test_v3_key(self):
        assert s3_alerts.key(date(2020, 1, 1), v3=True) == "Alerts/v3/2020-01-01.json.gz"

    def test_lamp_key(self):
        assert s3_alerts.lamp_key(date(2020, 1, 1)) == "Alerts/lamp/2020-01-01.json.gz"


class TestRoutesForAlert:
    def test_v3_shaped_alert(self):
        alert = {"attributes": {"informed_entity": [{"route": "Red"}, {"stop": "place-pktrm"}]}}
        assert s3_alerts.routes_for_alert(alert) == {"Red"}

    def test_v2_shaped_alert(self):
        alert = {"alert_versions": [{"informed_entity": [{"route_id": "Orange"}]}]}
        assert s3_alerts.routes_for_alert(alert) == {"Orange"}

    def test_entity_with_no_route_key_is_ignored(self):
        # A LAMP-derived alert with no known route (e.g. a facility-only alert)
        # omits the "route" key entirely rather than setting it null -- confirm
        # that doesn't add a bare None into the route set.
        alert = {"attributes": {"informed_entity": [{"stop": "70023"}]}}
        assert s3_alerts.routes_for_alert(alert) == set()


class TestGetLampAlerts:
    def test_filters_by_route_and_shares_v3_shape(self):
        payload = (
            '{"1": {"id": "1", "type": "alert", "attributes": '
            '{"informed_entity": [{"route": "Red"}]}}, '
            '"2": {"id": "2", "type": "alert", "attributes": '
            '{"informed_entity": [{"route": "Orange"}]}}}'
        )
        with mock.patch("chalicelib.s3_alerts.s3.download", return_value=payload) as mock_download:
            result = s3_alerts.get_lamp_alerts(date(2020, 1, 1), ["Red"])
        mock_download.assert_called_once_with("Alerts/lamp/2020-01-01.json.gz", "utf8")
        assert [a["id"] for a in result] == ["1"]

    def test_no_route_filter_returns_everything(self):
        payload = '{"1": {"id": "1", "type": "alert", "attributes": {"informed_entity": []}}}'
        with mock.patch("chalicelib.s3_alerts.s3.download", return_value=payload):
            result = s3_alerts.get_lamp_alerts(date(2020, 1, 1), None)
        assert [a["id"] for a in result] == ["1"]

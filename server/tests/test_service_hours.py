"""Tests for service_hours.py — scheduled vs. delivered service hours."""

from datetime import date

from chalicelib import service_hours


class TestGetServiceHours:
    def test_line_without_trip_metrics_returns_empty(self, monkeypatch):
        # DeliveredTripMetricsExtended has no rows for Green or Mattapan.
        monkeypatch.setattr(service_hours, "get_scheduled_service_hours", lambda **kwargs: {"2026-09-01": 100})
        monkeypatch.setattr(service_hours, "query_extended_trip_metrics", lambda **kwargs: [])

        result = service_hours.get_service_hours("line-green", date(2026, 9, 1), date(2026, 9, 30), "daily")

        assert result == []

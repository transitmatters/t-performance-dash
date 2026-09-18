"""Tests for speed.py — bus speed leaderboard S3 cache-aside behavior."""

import json
import time

import pytest
from botocore.exceptions import ClientError

from chalicelib import speed

START_DATE = "2020-01-01"
END_DATE = "2020-01-07"  # >6 months old relative to any real test run -> THREE_MONTHS max_age

ROWS = [
    {"route": "1", "miles_covered": 10, "total_time": 3600, "count": 5, "n_traversals": 5},
    {"route": "1", "miles_covered": 5, "total_time": 1800, "count": 3, "n_traversals": 3},
    {"route": "66", "miles_covered": 2, "total_time": 3600, "count": 2, "n_traversals": 2},
]


def not_found_error():
    return ClientError({"Error": {"Code": "NoSuchKey"}}, "GetObject")


class FakeS3:
    """Tracks download/upload calls and serves a single stored object, if any."""

    def __init__(self, initial=None, download_error=None):
        self.stored = initial
        self.download_error = download_error
        self.upload_calls = []

    def download(self, key, *args, **kwargs):
        if self.download_error is not None:
            raise self.download_error
        if self.stored is None:
            raise not_found_error()
        return self.stored

    def upload(self, key, data, *args, **kwargs):
        self.upload_calls.append((key, data))
        self.stored = data.decode() if isinstance(data, bytes) else data


class TestBusSpeedLeaderboardCache:
    def test_cache_miss_scans_and_writes_cache(self, monkeypatch):
        fake_s3 = FakeS3(download_error=not_found_error())
        scan_calls = []

        def fake_scan(table, start, end):
            scan_calls.append((table, start, end))
            return ROWS

        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
        monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", fake_scan)

        result = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

        assert len(scan_calls) == 1
        assert len(fake_s3.upload_calls) == 1
        # route "66" covers 2mph, route "1" covers 15mi/1.5hr=10mph -> "66" is slower, ranked first
        assert [entry["route"] for entry in result] == ["66", "1"]

    def test_cache_hit_skips_scan(self, monkeypatch):
        cached_payload = json.dumps(
            {"computed_at": time.time(), "data": [{"route": "66", "miles_covered": 2, "total_time": 3600}]}
        )
        fake_s3 = FakeS3(initial=cached_payload)

        def fail_if_called(*args, **kwargs):
            raise AssertionError("scan_trip_metrics_in_range should not be called on a cache hit")

        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
        monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", fail_if_called)

        result = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

        assert result == [{"route": "66", "miles_covered": 2, "total_time": 3600}]
        assert fake_s3.upload_calls == []

    def test_stale_cache_recomputes(self, monkeypatch):
        ancient = time.time() - 8_000_000  # older than THREE_MONTHS (7_776_000s)
        cached_payload = json.dumps({"computed_at": ancient, "data": [{"route": "stale"}]})
        fake_s3 = FakeS3(initial=cached_payload)
        scan_calls = []

        def fake_scan(table, start, end):
            scan_calls.append((table, start, end))
            return ROWS

        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
        monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", fake_scan)

        result = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

        assert len(scan_calls) == 1
        assert len(fake_s3.upload_calls) == 1
        assert [entry["route"] for entry in result] == ["66", "1"]

    def test_corrupt_cache_recomputes(self, monkeypatch):
        fake_s3 = FakeS3(initial="not valid json")
        scan_calls = []

        def fake_scan(table, start, end):
            scan_calls.append((table, start, end))
            return ROWS

        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
        monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", fake_scan)

        result = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

        assert len(scan_calls) == 1
        assert [entry["route"] for entry in result] == ["66", "1"]

    def test_unrelated_client_error_propagates(self, monkeypatch):
        fake_s3 = FakeS3(download_error=ClientError({"Error": {"Code": "AccessDenied"}}, "GetObject"))

        monkeypatch.setattr(speed.s3, "download", fake_s3.download)

        with pytest.raises(ClientError):
            speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

    def test_limit_slices_cached_full_list(self, monkeypatch):
        cached_data = [{"route": str(i)} for i in range(20)]
        cached_payload = json.dumps({"computed_at": time.time(), "data": cached_data})
        fake_s3 = FakeS3(initial=cached_payload)

        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)

        result = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=5)

        assert len(result) == 5
        assert result == cached_data[:5]

    def test_cache_key_scoped_to_date_range_not_limit(self):
        assert speed._leaderboard_cache_key(START_DATE, END_DATE) == speed._leaderboard_cache_key(START_DATE, END_DATE)
        assert "bus-speed-leaderboard/" in speed._leaderboard_cache_key(START_DATE, END_DATE)

"""Tests for speed.py — bus speed leaderboard cache, bus trip metrics rollups and rail trip metrics aggregation."""

import json
import time
import zlib

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

    @pytest.mark.parametrize(
        "download_error, stored",
        [
            (zlib.error("incorrect header check"), None),
            (UnicodeDecodeError("utf-8", b"\xff", 0, 1, "invalid start byte"), None),
            (None, json.dumps({"data": []})),  # missing computed_at
            (None, json.dumps({"computed_at": "yesterday", "data": []})),
            (None, json.dumps({"computed_at": time.time(), "data": "nope"})),
            (None, json.dumps(["not", "a", "dict"])),
        ],
    )
    def test_unreadable_cache_recomputes(self, monkeypatch, download_error, stored):
        fake_s3 = FakeS3(initial=stored, download_error=download_error)
        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
        monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", lambda table, start, end: ROWS)

        result = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

        assert [entry["route"] for entry in result] == ["66", "1"]
        assert len(fake_s3.upload_calls) == 1

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


DAILY_BUS_ROWS = [
    # 2026-01-05 is a Monday; 2026-01-11 closes that ISO week, 2026-01-12 opens the next.
    {"route": "1", "date": "2026-01-05", "miles_covered": 10, "total_time": 3600, "count": 5, "median_speed_mph": 9},
    {"route": "1", "date": "2026-01-11", "miles_covered": 5, "total_time": 1800, "count": 3, "median_speed_mph": 11},
    {"route": "1", "date": "2026-01-12", "miles_covered": 4, "total_time": 3600, "count": 2, "median_speed_mph": 4},
    {"route": "1", "date": "2026-02-02", "miles_covered": 6, "total_time": None, "count": 1},
]


class TestBusTripMetricsByRoute:
    @pytest.fixture
    def query_calls(self, monkeypatch):
        calls = []

        def fake_query(table, route, start, end):
            calls.append((table, route, start, end))
            return DAILY_BUS_ROWS

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", fake_query)
        return calls

    def params(self, start="2026-01-01", end="2026-02-28", **extra):
        return {"start_date": start, "end_date": end, "route": "1"} | extra

    def test_defaults_to_daily_rows_unchanged(self, query_calls):
        assert speed.trip_metrics_by_bus_route(self.params()) == DAILY_BUS_ROWS

    def test_weekly_sums_per_iso_week(self, query_calls):
        result = speed.trip_metrics_by_bus_route(self.params(agg="weekly"))
        assert [row["date"] for row in result] == ["2026-01-05", "2026-01-12", "2026-02-02"]
        assert result[0]["miles_covered"] == 15
        assert result[0]["total_time"] == 5400
        assert result[0]["count"] == 8
        assert "median_speed_mph" not in result[0]
        # Missing/None values count as zero rather than poisoning the sum.
        assert result[2]["total_time"] == 0

    def test_monthly_sums_per_calendar_month(self, query_calls):
        result = speed.trip_metrics_by_bus_route(self.params(agg="monthly"))
        assert [row["date"] for row in result] == ["2026-01-01", "2026-02-01"]
        assert result[0]["miles_covered"] == 19

    def test_year_range_allowed_when_weekly(self, query_calls):
        speed.trip_metrics_by_bus_route(self.params(start="2025-01-01", end="2026-01-01", agg="weekly"))
        assert len(query_calls) == 1

    def test_year_range_rejected_when_daily(self, query_calls):
        with pytest.raises(speed.ForbiddenError):
            speed.trip_metrics_by_bus_route(self.params(start="2025-01-01", end="2026-01-01"))
        assert query_calls == []

    def test_unknown_agg_rejected(self, query_calls):
        with pytest.raises(speed.BadRequestError):
            speed.trip_metrics_by_bus_route(self.params(agg="hourly"))

    def test_grouped_routes_summed_per_day(self, monkeypatch):
        calls = []

        def fake_query_routes(table, routes, start, end):
            calls.append(list(routes))
            return [
                [{"route": "114", "date": "2026-01-05", "miles_covered": 1, "total_time": 60, "count": 1}],
                [
                    {"route": "116", "date": "2026-01-05", "miles_covered": 2, "total_time": 120, "count": 2},
                    {"route": "116", "date": "2026-01-06", "miles_covered": 3, "total_time": 180, "count": 3},
                ],
            ]

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_routes", fake_query_routes)
        result = speed.trip_metrics_by_bus_route(self.params(route="114, 116"))

        assert calls == [["114", "116"]]
        assert [(row["date"], row["miles_covered"], row["route"]) for row in result] == [
            ("2026-01-05", 3, "114,116"),
            ("2026-01-06", 3, "114,116"),
        ]

    def test_blank_route_rejected(self, query_calls):
        with pytest.raises(speed.BadRequestError):
            speed.trip_metrics_by_bus_route(self.params(route=" , "))


def _bands(**bands):
    """A `time_bands` map: each band given as (count, n_traversals, n_interpolated, miles_covered, total_time)."""
    return {band: dict(zip(speed.BUS_BAND_FIELDS, values)) for band, values in bands.items()}


BANDED_BUS_ROWS = [
    # Monday.
    {
        "route": "1",
        "date": "2026-01-05",
        "day_type": "business_day",
        "count": 40,
        "n_traversals": 900,
        "n_interpolated": 9,
        "miles_covered": 100,
        "total_time": 36000,
        "median_speed_mph": 9.5,
        "mean_speed_mph": 10.1,
        "time_bands": _bands(am_peak=(8, 200, 2, 20, 9000), midday=(20, 400, 4, 50, 15000)),
    },
    # Saturday, with no am_peak traversals at all.
    {
        "route": "1",
        "date": "2026-01-10",
        "day_type": "weekend_or_holiday",
        "count": 20,
        "n_traversals": 400,
        "n_interpolated": 1,
        "miles_covered": 50,
        "total_time": 14400,
        "median_speed_mph": 12.0,
        "mean_speed_mph": 12.5,
        "time_bands": _bands(midday=(12, 250, 1, 30, 7200)),
    },
    # A Monday MBTA ran holiday service on: the row's own day_type decides, not the weekday.
    {
        "route": "1",
        "date": "2026-01-19",
        "day_type": "weekend_or_holiday",
        "count": 25,
        "n_traversals": 500,
        "n_interpolated": 0,
        "miles_covered": 60,
        "total_time": 18000,
        "median_speed_mph": 11.0,
        "mean_speed_mph": 11.4,
        "time_bands": _bands(am_peak=(5, 100, 0, 12, 3600)),
    },
    # Written before the pipeline recorded day_type/time_bands.
    {
        "route": "1",
        "date": "2026-01-20",
        "count": 30,
        "n_traversals": 700,
        "n_interpolated": 3,
        "miles_covered": 80,
        "total_time": 28800,
        "median_speed_mph": 10.0,
        "mean_speed_mph": 10.2,
    },
    # Tuesday, the week after the Monday above.
    {
        "route": "1",
        "date": "2026-01-13",
        "day_type": "business_day",
        "count": 41,
        "n_traversals": 910,
        "n_interpolated": 5,
        "miles_covered": 101,
        "total_time": 36100,
        "median_speed_mph": 9.4,
        "mean_speed_mph": 10.0,
        "time_bands": _bands(am_peak=(9, 210, 1, 22, 9900)),
    },
]


class TestBusTripMetricsFilters:
    @pytest.fixture
    def query_calls(self, monkeypatch):
        calls = []

        def fake_query(table, route, start, end):
            calls.append((table, route, start, end))
            return BANDED_BUS_ROWS

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", fake_query)
        return calls

    def params(self, **extra):
        return {"start_date": "2026-01-01", "end_date": "2026-01-31", "route": "1"} | extra

    def by_date(self, rows):
        return {row["date"]: row for row in rows}

    def test_no_filters_passes_rows_through(self, query_calls):
        assert speed.trip_metrics_by_bus_route(self.params()) == BANDED_BUS_ROWS

    def test_time_band_flattens_daily_rows(self, query_calls):
        rows = self.by_date(speed.trip_metrics_by_bus_route(self.params(time_band="am_peak")))

        assert rows["2026-01-05"] == {
            "route": "1",
            "date": "2026-01-05",
            "day_type": "business_day",
            "count": 8,
            "n_traversals": 200,
            "n_interpolated": 2,
            "miles_covered": 20,
            "total_time": 9000,
        }

    def test_absent_band_reads_as_zero(self, query_calls):
        rows = self.by_date(speed.trip_metrics_by_bus_route(self.params(time_band="am_peak")))

        saturday = rows["2026-01-10"]
        assert {field: saturday[field] for field in speed.BUS_BAND_FIELDS} == dict.fromkeys(speed.BUS_BAND_FIELDS, 0)
        assert saturday["day_type"] == "weekend_or_holiday"

    def test_row_without_time_bands_reads_as_zero(self, query_calls):
        rows = self.by_date(speed.trip_metrics_by_bus_route(self.params(time_band="midday")))

        legacy = rows["2026-01-20"]
        assert {field: legacy[field] for field in speed.BUS_BAND_FIELDS} == dict.fromkeys(speed.BUS_BAND_FIELDS, 0)
        assert "median_speed_mph" not in legacy and "mean_speed_mph" not in legacy

    def test_day_type_keeps_matching_rows_untouched(self, query_calls):
        rows = speed.trip_metrics_by_bus_route(self.params(day_type="business_day"))

        assert rows == [BANDED_BUS_ROWS[0], BANDED_BUS_ROWS[4]]

    def test_day_type_follows_the_row_not_the_weekday(self, query_calls):
        rows = speed.trip_metrics_by_bus_route(self.params(day_type="weekend_or_holiday"))

        # The holiday Monday is in, and the row with no day_type is out of both.
        assert [row["date"] for row in rows] == ["2026-01-10", "2026-01-19"]

    def test_weekly_rollup_sums_band_totals(self, query_calls):
        rows = speed.trip_metrics_by_bus_route(self.params(agg="weekly", time_band="am_peak"))

        assert rows == [
            # Mon 1/5 + Sat 1/10 (no am_peak).
            {
                "date": "2026-01-05",
                "route": "1",
                "miles_covered": 20,
                "total_time": 9000,
                "count": 8,
                "n_traversals": 200,
            },
            # Tue 1/13.
            {
                "date": "2026-01-12",
                "route": "1",
                "miles_covered": 22,
                "total_time": 9900,
                "count": 9,
                "n_traversals": 210,
            },
            # Mon 1/19 + the pre-breakdown row on Tue 1/20, which counts as zero.
            {
                "date": "2026-01-19",
                "route": "1",
                "miles_covered": 12,
                "total_time": 3600,
                "count": 5,
                "n_traversals": 100,
            },
        ]

    def test_monthly_rollup_with_band_and_day_type(self, query_calls):
        [month] = speed.trip_metrics_by_bus_route(
            self.params(agg="monthly", time_band="am_peak", day_type="business_day")
        )

        assert month == {
            "date": "2026-01-01",
            "route": "1",
            "miles_covered": 42,
            "total_time": 18900,
            "count": 17,
            "n_traversals": 410,
        }

    def test_grouped_routes_sum_band_totals_per_day(self, monkeypatch):
        def fake_query_routes(table, routes, start, end):
            return [
                [
                    {
                        "route": "114",
                        "date": "2026-01-05",
                        "day_type": "business_day",
                        "miles_covered": 10,
                        "total_time": 3600,
                        "count": 4,
                        "n_traversals": 40,
                        "time_bands": _bands(am_peak=(1, 10, 0, 2, 600)),
                    }
                ],
                [
                    {
                        "route": "116",
                        "date": "2026-01-05",
                        "day_type": "business_day",
                        "miles_covered": 30,
                        "total_time": 7200,
                        "count": 9,
                        "n_traversals": 90,
                        "time_bands": _bands(am_peak=(3, 30, 1, 6, 1200)),
                    },
                    # A weekend day, filtered out per route_id before anything is summed.
                    {
                        "route": "116",
                        "date": "2026-01-10",
                        "day_type": "weekend_or_holiday",
                        "miles_covered": 5,
                        "total_time": 900,
                        "count": 2,
                        "n_traversals": 20,
                        "time_bands": _bands(am_peak=(1, 5, 0, 1, 300)),
                    },
                ],
            ]

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_routes", fake_query_routes)
        rows = speed.trip_metrics_by_bus_route(
            self.params(route="114,116", time_band="am_peak", day_type="business_day")
        )

        assert rows == [
            {
                "date": "2026-01-05",
                "route": "114,116",
                "miles_covered": 8,
                "total_time": 1800,
                "count": 4,
                "n_traversals": 40,
            }
        ]

    def test_filters_leave_the_dynamo_query_unchanged(self, query_calls):
        speed.trip_metrics_by_bus_route(self.params(agg="weekly"))
        speed.trip_metrics_by_bus_route(self.params(agg="weekly", time_band="pm_peak", day_type="business_day"))

        assert query_calls[0] == query_calls[1]

    @pytest.mark.parametrize(
        "bad",
        [{"time_band": "all_day"}, {"time_band": "rush_hour"}, {"time_band": ""}, {"day_type": "weekday"}],
    )
    def test_unknown_filter_rejected_before_querying(self, query_calls, bad):
        with pytest.raises(speed.BadRequestError):
            speed.trip_metrics_by_bus_route(self.params(**bad))
        assert query_calls == []


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

    [record] = speed.aggregate_actual_trips(trips, "daily", "2026-09-21")

    assert record["fleet_mix_red1"] == 4.1
    assert record["fleet_mix_red4"] == 95.9
    assert record["avg_car_age"] == 24.5
    assert record["miles_covered"] == 20.0


def test_days_without_fleet_data_omit_fleet_fields():
    trips = [
        [_row("line-red-a", "2026-09-20"), _row("line-red-a", "2026-09-21", avg_car_age=24.5, fleet_mix_red4=95.9)],
        [_row("line-red-b", "2026-09-20"), _row("line-red-b", "2026-09-21", avg_car_age=24.5, fleet_mix_red4=95.9)],
    ]

    no_data, has_data = speed.aggregate_actual_trips(trips, "daily", "2026-09-20")

    assert "avg_car_age" not in no_data and "fleet_mix_red4" not in no_data
    assert has_data["fleet_mix_red4"] == 95.9

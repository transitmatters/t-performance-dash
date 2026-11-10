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


FLEET_ROWS = [
    {
        "route": "all",
        "date": "2026-01-05",
        "fleet_trips": 300,
        "pct_battery_trips": 10.0,
        "avg_bus_age": 8.0,
        "fleet_mix_diesel": 20.0,
        "fleet_mix_hybrid": 70.0,
        "fleet_mix_battery": 10.0,
    },
    {
        "route": "all",
        "date": "2026-01-06",
        "fleet_trips": 100,
        "pct_battery_trips": 30.0,
        "avg_bus_age": 6.0,
        "fleet_mix_diesel": 10.0,
        "fleet_mix_hybrid": 60.0,
        "fleet_mix_battery": 30.0,
    },
    # Speed-only row, from before fleet data: doesn't drag the averages toward zero.
    {"route": "all", "date": "2026-01-07", "miles_covered": 4, "total_time": 3600, "count": 2},
]


class TestFleetRollup:
    def test_weights_each_day_by_its_sampled_trips(self):
        pooled = speed._rollup_fleet_fields(FLEET_ROWS)
        assert pooled["fleet_trips"] == 400
        assert pooled["pct_battery_trips"] == 15.0
        assert pooled["avg_bus_age"] == 7.5
        mix = [pooled[f"fleet_mix_{kind}"] for kind in ("diesel", "hybrid", "battery")]
        assert mix == [17.5, 67.5, 15.0]
        assert sum(mix) == pytest.approx(100)

    def test_no_fleet_data_adds_nothing(self):
        assert speed._rollup_fleet_fields(FLEET_ROWS[2:]) == {}

    def test_bus_weekly_rollup_keeps_fleet_fields(self, monkeypatch):
        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", lambda *args: FLEET_ROWS)
        params = {"start_date": "2026-01-01", "end_date": "2026-01-31", "route": "all", "agg": "weekly"}
        [week] = speed.trip_metrics_by_bus_route(params)
        assert week["count"] == 2
        assert week["pct_battery_trips"] == 15.0
        assert week["fleet_trips"] == 400


CR_ROWS = [
    {
        "route": "CR-Fairmount",
        "date": "2026-01-05",
        "fleet_trips": 30,
        "avg_cab_car_age": 3.0,
        "fleet_mix_rotem": 100.0,
    },
    {
        "route": "CR-Fairmount",
        "date": "2026-01-06",
        "fleet_trips": 10,
        "avg_cab_car_age": 35.0,
        "fleet_mix_rotem": 50.0,
        "fleet_mix_kawasaki": 50.0,
    },
]


class TestCrTripMetricsByRoute:
    @pytest.fixture
    def query_calls(self, monkeypatch):
        calls = []

        def fake_query(table, route, start, end):
            calls.append((table, route, start, end))
            return CR_ROWS

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", fake_query)
        return calls

    def params(self, **extra):
        return {"start_date": "2026-01-01", "end_date": "2026-01-31", "route": "CR-Fairmount"} | extra

    def test_daily_rows_unchanged(self, query_calls):
        assert speed.trip_metrics_by_cr_route(self.params()) == CR_ROWS
        assert query_calls == [("DeliveredTripMetricsCR", "CR-Fairmount", "2026-01-01", "2026-01-31")]

    def test_monthly_pools_fleet_without_bus_fields(self, query_calls):
        [month] = speed.trip_metrics_by_cr_route(self.params(agg="monthly"))
        assert month == {
            "date": "2026-01-01",
            "route": "CR-Fairmount",
            "fleet_trips": 40,
            "avg_cab_car_age": 11.0,
            "fleet_mix_rotem": 87.5,
            # Missing from the first day's row, so 0% that day.
            "fleet_mix_kawasaki": 12.5,
        }

    def test_unknown_agg_rejected(self, query_calls):
        with pytest.raises(speed.BadRequestError):
            speed.trip_metrics_by_cr_route(self.params(agg="hourly"))

    def test_long_daily_range_rejected(self, query_calls):
        with pytest.raises(speed.ForbiddenError):
            speed.trip_metrics_by_cr_route(self.params(start_date="2025-01-01", end_date="2026-01-01"))
        assert query_calls == []

    def test_blank_route_rejected(self, query_calls):
        with pytest.raises(speed.BadRequestError):
            speed.trip_metrics_by_cr_route(self.params(route=" "))


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

    @pytest.mark.parametrize("agg", ["weekly", "monthly"])
    @pytest.mark.parametrize("day_type", [None, "business_day"])
    def test_rollup_carries_each_band_as_its_filtered_request_would(self, query_calls, agg, day_type):
        filters = {"agg": agg} | ({"day_type": day_type} if day_type else {})
        rolled = speed.trip_metrics_by_bus_route(self.params(**filters))

        for band in speed.BUS_TIME_BANDS:
            narrowed = speed.trip_metrics_by_bus_route(self.params(**filters, time_band=band))
            assert [row["date"] for row in rolled] == [row["date"] for row in narrowed]
            for whole, one_band in zip(rolled, narrowed):
                for field in ("miles_covered", "total_time", "count", "n_traversals"):
                    assert whole["time_bands"][band][field] == one_band[field], (band, whole["date"], field)

    def test_rollup_band_sums_by_hand(self, query_calls):
        weeks = self.by_date(speed.trip_metrics_by_bus_route(self.params(agg="weekly")))

        # Mon 1/5 (am_peak, midday) + Sat 1/10 (midday only).
        assert weeks["2026-01-05"]["time_bands"]["midday"] == {
            "count": 32,
            "n_traversals": 650,
            "n_interpolated": 5,
            "miles_covered": 80,
            "total_time": 22200,
        }
        # A band no row ran in is still listed, as zeros.
        assert weeks["2026-01-05"]["time_bands"]["late_night"] == dict.fromkeys(speed.BUS_BAND_FIELDS, 0)
        # The holiday Monday has a breakdown and the pre-breakdown Tuesday reads as zero beside it,
        # while the all-day totals still include both.
        assert weeks["2026-01-19"]["time_bands"]["am_peak"]["miles_covered"] == 12
        assert weeks["2026-01-19"]["miles_covered"] == 140

    def test_rollup_without_any_breakdown_has_no_time_bands(self, monkeypatch):
        legacy = [row for row in BANDED_BUS_ROWS if "time_bands" not in row]
        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", lambda *args: legacy)

        [week] = speed.trip_metrics_by_bus_route(self.params(agg="weekly"))

        assert "time_bands" not in week
        assert week["miles_covered"] == 80

    def test_grouped_daily_rows_sum_bands_across_routes(self, monkeypatch):
        def fake_query_routes(table, routes, start, end):
            return [
                [
                    {
                        "route": "114",
                        "date": "2026-01-05",
                        "miles_covered": 10,
                        "total_time": 3600,
                        "time_bands": _bands(am_peak=(1, 10, 0, 2, 600)),
                    }
                ],
                [
                    {
                        "route": "116",
                        "date": "2026-01-05",
                        "miles_covered": 30,
                        "total_time": 7200,
                        "time_bands": _bands(am_peak=(3, 30, 1, 6, 1200), evening=(2, 20, 0, 4, 900)),
                    }
                ],
            ]

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_routes", fake_query_routes)
        [day] = speed.trip_metrics_by_bus_route(self.params(route="114,116"))

        assert day["time_bands"]["am_peak"] == {
            "count": 4,
            "n_traversals": 40,
            "n_interpolated": 1,
            "miles_covered": 8,
            "total_time": 1800,
        }
        assert day["time_bands"]["evening"]["miles_covered"] == 4

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


def _headways(under_50, from_50, from_75, from_125, over_150):
    """Headway bucket counts, in BUS_HEADWAY_FIELDS order."""
    return dict(zip(speed.BUS_HEADWAY_FIELDS, (under_50, from_50, from_75, from_125, over_150)))


# Sun 2025-12-21 closes the ISO week before the pipeline started counting headways on 2025-12-24.
HEADWAY_BUS_ROWS = [
    {"route": "28", "date": "2025-12-21", "miles_covered": 10, "total_time": 3600, "count": 5},
    # Mon-Tue of the next week have no counts, Wednesday does.
    {"route": "28", "date": "2025-12-22", "miles_covered": 10, "total_time": 3600, "count": 5},
    {
        "route": "28",
        "date": "2025-12-24",
        "miles_covered": 10,
        "total_time": 3600,
        "count": 5,
        **_headways(1, 2, 3, 4, 5),
    },
    {
        "route": "28",
        "date": "2025-12-25",
        "miles_covered": 10,
        "total_time": 3600,
        "count": 5,
        **_headways(10, 20, 30, 40, 50),
    },
]


class TestBusHeadwayCounts:
    @pytest.fixture(autouse=True)
    def query(self, monkeypatch):
        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", lambda *args: HEADWAY_BUS_ROWS)

    def params(self, **extra):
        return {"start_date": "2025-12-15", "end_date": "2025-12-31", "route": "28"} | extra

    def test_daily_rows_pass_through(self):
        assert speed.trip_metrics_by_bus_route(self.params()) == HEADWAY_BUS_ROWS

    def test_weekly_sums_the_days_that_have_counts(self):
        before, after = speed.trip_metrics_by_bus_route(self.params(agg="weekly"))

        # A week with no counts at all leaves them off, rather than reporting zero headways.
        assert not set(speed.BUS_HEADWAY_FIELDS) & set(before)
        assert {field: after[field] for field in speed.BUS_HEADWAY_FIELDS} == _headways(11, 22, 33, 44, 55)
        assert after["count"] == 15

    def test_time_band_leaves_out_all_day_counts(self):
        rows = speed.trip_metrics_by_bus_route(self.params(time_band="am_peak"))
        weekly = speed.trip_metrics_by_bus_route(self.params(time_band="am_peak", agg="weekly"))

        for row in rows + weekly:
            assert not set(speed.BUS_HEADWAY_FIELDS) & set(row)

    def test_day_type_keeps_counts(self, monkeypatch):
        rows = [row | {"day_type": "business_day"} for row in HEADWAY_BUS_ROWS]
        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", lambda *args: rows)

        [_, week] = speed.trip_metrics_by_bus_route(self.params(day_type="business_day", agg="weekly"))

        assert week["headways_under_50"] == 11

    def test_grouped_routes_sum_counts_per_day(self, monkeypatch):
        def fake_query_routes(table, routes, start, end):
            return [
                [{"route": "104", "date": "2026-01-05", "count": 1, **_headways(1, 1, 1, 1, 1)}],
                [
                    {"route": "109", "date": "2026-01-05", "count": 1, **_headways(2, 0, 5, 0, 1)},
                    {"route": "109", "date": "2026-01-06", "count": 1},
                ],
            ]

        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_routes", fake_query_routes)
        monday, tuesday = speed.trip_metrics_by_bus_route(
            {"start_date": "2026-01-05", "end_date": "2026-01-06", "route": "104,109"}
        )

        assert {field: monday[field] for field in speed.BUS_HEADWAY_FIELDS} == _headways(3, 1, 6, 1, 2)
        assert not set(speed.BUS_HEADWAY_FIELDS) & set(tuesday)


def test_leaderboard_sums_headway_counts(monkeypatch):
    rows = [
        {
            "route": "28",
            "miles_covered": 10,
            "total_time": 3600,
            "count": 5,
            "n_traversals": 5,
            **_headways(1, 2, 3, 4, 5),
        },
        # A day from before the pipeline counted headways.
        {"route": "28", "miles_covered": 10, "total_time": 3600, "count": 5, "n_traversals": 5},
        {
            "route": "28",
            "miles_covered": 10,
            "total_time": 3600,
            "count": 5,
            "n_traversals": 5,
            **_headways(1, 1, 1, 1, 1),
        },
        {"route": "66", "miles_covered": 2, "total_time": 3600, "count": 2, "n_traversals": 2},
    ]
    fake_s3 = FakeS3(download_error=not_found_error())
    monkeypatch.setattr(speed.s3, "download", fake_s3.download)
    monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
    monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", lambda *args: rows)

    route_66, route_28 = speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)

    assert {field: route_28[field] for field in speed.BUS_HEADWAY_FIELDS} == _headways(2, 3, 4, 5, 6)
    assert route_28["count"] == 15
    assert not set(speed.BUS_HEADWAY_FIELDS) & set(route_66)


def test_leaderboard_cache_key_is_versioned():
    # Lists cached before entries had headway counts must not be served.
    assert speed._leaderboard_cache_key(START_DATE, END_DATE) == (
        f"bus-speed-leaderboard/v{speed.LEADERBOARD_CACHE_VERSION}/{START_DATE}_{END_DATE}.json"
    )


def _trips(scheduled, unobserved, waived):
    return {"scheduled_trips": scheduled, "unobserved_trips": unobserved, "unobserved_waived_trips": waived}


TRIP_COUNT_ROWS = [
    # Tuesday 2025-12-23, the week before trip counts began: speed fields only.
    {"route": "1", "date": "2025-12-23", "miles_covered": 10, "total_time": 3600, "count": 200, "n_traversals": 9},
    # Mon 12/29 and Tue 12/30, the first full week with them.
    {
        "route": "1",
        "date": "2025-12-29",
        "day_type": "business_day",
        "miles_covered": 10,
        "total_time": 3600,
        "count": 210,
        "n_traversals": 9,
        "time_bands": _bands(am_peak=(30, 2, 0, 2, 600)),
        **_trips(215, 5, 3),
    },
    # Every trip unobserved: trip counts but no speed fields.
    {"route": "1", "date": "2025-12-30", "day_type": "business_day", **_trips(215, 215, 0)},
]


class TestBusTripCounts:
    @pytest.fixture(autouse=True)
    def fake_query(self, monkeypatch):
        monkeypatch.setattr(speed.dynamo, "query_daily_trips_on_route", lambda *args: TRIP_COUNT_ROWS)

    def params(self, **extra):
        return {"start_date": "2025-12-22", "end_date": "2026-01-04", "route": "1"} | extra

    def test_daily_rows_keep_their_counts(self):
        rows = speed.trip_metrics_by_bus_route(self.params())
        assert [row.get("unobserved_trips") for row in rows] == [None, 5, 215]

    def test_weekly_sums_counts_only_where_measured(self):
        before, first = speed.trip_metrics_by_bus_route(self.params(agg="weekly"))

        # Absent, not zero: nothing was measured that week.
        assert not set(speed.BUS_TRIP_COUNT_FIELDS) & before.keys()
        assert {field: first[field] for field in speed.BUS_TRIP_COUNT_FIELDS} == _trips(430, 220, 3)
        # The all-unobserved day adds no speed, but its trips still count.
        assert first["count"] == 210

    def test_time_band_drops_whole_day_counts(self):
        rows = speed.trip_metrics_by_bus_route(self.params(time_band="am_peak"))
        assert not any(set(speed.BUS_TRIP_COUNT_FIELDS) & row.keys() for row in rows)

        weekly = speed.trip_metrics_by_bus_route(self.params(agg="weekly", time_band="am_peak"))
        assert not any(set(speed.BUS_TRIP_COUNT_FIELDS) & row.keys() for row in weekly)

    def test_grouped_routes_sum_counts_per_day(self, monkeypatch):
        monkeypatch.setattr(
            speed.dynamo,
            "query_daily_trips_on_routes",
            lambda *args: [
                [{"route": "114", "date": "2026-01-05", "miles_covered": 1, "total_time": 60, **_trips(20, 1, 1)}],
                [{"route": "116", "date": "2026-01-05", "miles_covered": 2, "total_time": 120, **_trips(80, 3, 0)}],
            ],
        )
        [day] = speed.trip_metrics_by_bus_route(self.params(route="114,116"))
        assert {field: day[field] for field in speed.BUS_TRIP_COUNT_FIELDS} == _trips(100, 4, 1)


class TestBusLeaderboardTripCounts:
    @pytest.fixture
    def ranked(self, monkeypatch):
        fake_s3 = FakeS3(download_error=not_found_error())
        monkeypatch.setattr(speed.s3, "download", fake_s3.download)
        monkeypatch.setattr(speed.s3, "upload", fake_s3.upload)
        rows = [
            {"route": "1", "miles_covered": 10, "total_time": 3600, "count": 5, "n_traversals": 5, **_trips(6, 1, 1)},
            {"route": "1", "miles_covered": 5, "total_time": 1800, "count": 3, "n_traversals": 3},
            {"route": "1", **_trips(4, 4, 0)},
            {"route": "66", "miles_covered": 2, "total_time": 3600, "count": 2, "n_traversals": 2},
            # Trips, but never observed in the range, so no speed to rank by.
            {"route": "8993", **_trips(3, 3, 0)},
        ]
        monkeypatch.setattr(speed.dynamo, "scan_trip_metrics_in_range", lambda *args: rows)
        return {entry["route"]: entry for entry in speed.bus_speed_leaderboard(START_DATE, END_DATE, limit=10)}

    def test_sums_counts_per_route(self, ranked):
        assert ranked["1"] == {
            "route": "1",
            "miles_covered": 15,
            "total_time": 5400,
            "count": 8,
            "n_traversals": 8,
            **_trips(10, 5, 1),
        }

    def test_route_without_counts_omits_them(self, ranked):
        assert not set(speed.BUS_TRIP_COUNT_FIELDS) & ranked["66"].keys()

    def test_route_without_speed_left_out(self, ranked):
        assert "8993" not in ranked

    def test_cache_key_versioned(self):
        # So a list cached before the trip counts isn't served without them.
        assert f"/v{speed.LEADERBOARD_CACHE_VERSION}/" in speed._leaderboard_cache_key(START_DATE, END_DATE)


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

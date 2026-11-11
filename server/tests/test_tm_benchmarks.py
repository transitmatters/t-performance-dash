"""Tests for tm_benchmarks' per-container cache of benchmark files."""

import io
import json
from unittest import mock

import pytest
from botocore.exceptions import ClientError

from chalicelib import tm_benchmarks


def _client_error(code):
    return ClientError({"Error": {"Code": code, "Message": code}}, "GetObject")


def _benchmark_file(benchmarks):
    return {"Body": io.BytesIO(json.dumps({"color": "Red", "benchmarks": benchmarks}).encode())}


@pytest.fixture(autouse=True)
def empty_cache(monkeypatch):
    monkeypatch.setattr(tm_benchmarks, "_cache", {})
    monkeypatch.setattr(tm_benchmarks, "_attempted", set())


def test_loads_and_caches_a_benchmark_file():
    with mock.patch.object(
        tm_benchmarks.s3.s3, "get_object", return_value=_benchmark_file({"70061|70063": 120})
    ) as get_object:
        assert tm_benchmarks.get_travel_time_benchmark("Red", "70061", "70063") == 120
        assert tm_benchmarks.get_travel_time_benchmark("Red", "70061", "70063") == 120
    get_object.assert_called_once()


def test_missing_file_is_cached_as_no_benchmarks():
    with mock.patch.object(tm_benchmarks.s3.s3, "get_object", side_effect=_client_error("NoSuchKey")) as get_object:
        assert tm_benchmarks.get_travel_time_benchmark("Mattapan", "70261", "70264") is None
        assert tm_benchmarks.get_travel_time_benchmark("Mattapan", "70261", "70264") is None
    get_object.assert_called_once()


@pytest.mark.parametrize("code", ["SlowDown", "InternalError", "ServiceUnavailable", "AccessDenied"])
def test_other_s3_errors_raise_and_are_retried(code):
    with mock.patch.object(tm_benchmarks.s3.s3, "get_object", side_effect=_client_error(code)):
        with pytest.raises(ClientError):
            tm_benchmarks.get_travel_time_benchmark("Red", "70061", "70063")

    # The failure isn't remembered, so the next request reads the file again.
    with mock.patch.object(
        tm_benchmarks.s3.s3, "get_object", return_value=_benchmark_file({"70061|70063": 120})
    ) as get_object:
        assert tm_benchmarks.get_travel_time_benchmark("Red", "70061", "70063") == 120
    get_object.assert_called_once()

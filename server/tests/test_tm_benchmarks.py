"""Tests for tm_benchmarks.py -- which S3 failures are remembered for the container's life."""

import io
import json
from unittest import mock

import pytest
from botocore.exceptions import ClientError

from chalicelib import tm_benchmarks


@pytest.fixture(autouse=True)
def empty_cache(monkeypatch):
    monkeypatch.setattr(tm_benchmarks, "_cache", {})
    monkeypatch.setattr(tm_benchmarks, "_attempted", set())


def error(code):
    return ClientError({"Error": {"Code": code, "Message": code}}, "GetObject")


def benchmark_file(benchmarks):
    return {"Body": io.BytesIO(json.dumps({"benchmarks": benchmarks}).encode())}


def test_missing_file_is_remembered_as_no_benchmarks():
    with mock.patch.object(tm_benchmarks.s3.s3, "get_object", side_effect=error("NoSuchKey")) as get:
        assert tm_benchmarks.get_travel_time_benchmark("Red", "a", "b") is None
        assert tm_benchmarks.get_travel_time_benchmark("Red", "a", "b") is None
    assert get.call_count == 1


def test_transient_error_raises_and_is_retried():
    with mock.patch.object(
        tm_benchmarks.s3.s3,
        "get_object",
        side_effect=[error("SlowDown"), benchmark_file({"a|b": 120})],
    ):
        with pytest.raises(ClientError):
            tm_benchmarks.get_travel_time_benchmark("Red", "a", "b")
        assert tm_benchmarks.get_travel_time_benchmark("Red", "a", "b") == 120

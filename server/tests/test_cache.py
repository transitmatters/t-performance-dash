from datetime import datetime, timedelta

import pytest

from chalicelib import cache


def days_ago(n: int) -> str:
    return (datetime.now(cache.EASTERN_TIME) - timedelta(days=n)).strftime("%Y-%m-%d")


@pytest.mark.parametrize(
    "params, expected",
    [
        ({"end_date": days_ago(0)}, cache.FIFTEEN_MINUTES),
        ({"date": days_ago(1)}, cache.FIFTEEN_MINUTES),
        ({"end_date": days_ago(2)}, cache.ONE_HOUR),
        ({"end_date": days_ago(400)}, cache.THREE_MONTHS),
        ({"end_date": "not-a-date"}, cache.ONE_HOUR),
        ({}, cache.ONE_HOUR),
    ],
)
def test_get_cache_max_age(params, expected):
    assert cache.get_cache_max_age(params) == expected


@pytest.mark.parametrize(
    "days, expected",
    [
        (0, cache.FIFTEEN_MINUTES),
        (1, cache.ONE_HOUR),
        (2, cache.ONE_HOUR),
        (400, cache.THREE_MONTHS),
    ],
)
def test_get_cache_max_age_yesterday_override(days, expected):
    assert cache.get_cache_max_age({"date": days_ago(days)}, yesterday_max_age=cache.ONE_HOUR) == expected

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

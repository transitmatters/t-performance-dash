from datetime import datetime

import pytest

from chalicelib import cache
from chalicelib.date_utils import EASTERN_TIME

# Midday, when the service day and the calendar day agree
NOON = datetime(2026, 11, 20, 12, 0, tzinfo=EASTERN_TIME)
# Before 3 AM the 19th's service is still running, so the 19th is today
HALF_PAST_MIDNIGHT = datetime(2026, 11, 20, 0, 30, tzinfo=EASTERN_TIME)
THREE_AM = datetime(2026, 11, 20, 3, 0, tzinfo=EASTERN_TIME)


@pytest.mark.parametrize(
    "params, now, expected",
    [
        ({"end_date": "2026-11-20"}, NOON, cache.FIFTEEN_MINUTES),
        ({"date": "2026-11-19"}, NOON, cache.FIFTEEN_MINUTES),
        ({"end_date": "2026-11-18"}, NOON, cache.ONE_HOUR),
        ({"end_date": "2025-10-16"}, NOON, cache.THREE_MONTHS),
        ({"to_date": "2026-11-21"}, NOON, cache.FIFTEEN_MINUTES),
        ({"end_date": "not-a-date"}, NOON, cache.ONE_HOUR),
        ({}, NOON, cache.ONE_HOUR),
        ({"date": "2026-11-20"}, HALF_PAST_MIDNIGHT, cache.FIFTEEN_MINUTES),
        ({"date": "2026-11-19"}, HALF_PAST_MIDNIGHT, cache.FIFTEEN_MINUTES),
        ({"date": "2026-11-18"}, HALF_PAST_MIDNIGHT, cache.FIFTEEN_MINUTES),
        ({"date": "2026-11-17"}, HALF_PAST_MIDNIGHT, cache.ONE_HOUR),
    ],
)
def test_get_cache_max_age(params, now, expected):
    assert cache.get_cache_max_age(params, now=now) == expected


@pytest.mark.parametrize(
    "date, now, expected",
    [
        ("2026-11-20", NOON, cache.FIFTEEN_MINUTES),
        ("2026-11-19", NOON, cache.ONE_HOUR),
        ("2026-11-18", NOON, cache.ONE_HOUR),
        ("2025-10-16", NOON, cache.THREE_MONTHS),
        # The 19th's service runs until 3 AM on the 20th, so it keeps the short lifetime until then
        ("2026-11-19", HALF_PAST_MIDNIGHT, cache.FIFTEEN_MINUTES),
        ("2026-11-18", HALF_PAST_MIDNIGHT, cache.ONE_HOUR),
        ("2026-11-19", THREE_AM, cache.ONE_HOUR),
    ],
)
def test_get_cache_max_age_yesterday_override(date, now, expected):
    assert cache.get_cache_max_age({"date": date}, yesterday_max_age=cache.ONE_HOUR, now=now) == expected

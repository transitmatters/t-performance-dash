"""Read TransitMatters travel-time benchmarks produced by mbta-performance.

Benchmarks live at s3://tm-mbta-performance/Benchmarks-tm/traveltimes/{Color}.json
as `{"color": "...", "benchmarks": {"{from}|{to}": seconds}}`. Each color file is
small and changes at most monthly, so we cache it in-process for the lifetime of
the Lambda container.
"""

import json
import logging
from typing import Optional

from botocore.exceptions import ClientError

from chalicelib import s3

logger = logging.getLogger(__name__)

BENCHMARKS_PREFIX = "Benchmarks-tm/traveltimes"

# route_id (as it appears in LAMP events) -> slow-zones archive color folder
ROUTE_ID_TO_COLOR = {
    "Red": "Red",
    "Blue": "Blue",
    "Orange": "Orange",
    "Green-B": "Green",
    "Green-C": "Green",
    "Green-D": "Green",
    "Green-E": "Green",
    "Mattapan": "Mattapan",
}

_cache: dict[str, dict[str, int]] = {}
# Colors whose file we've already tried to load. Avoids retrying on every call
# for lines that have no benchmark file (bus, CR, or new lines before backfill).
_attempted: set[str] = set()


def _load_color(color: str) -> dict[str, int]:
    key = f"{BENCHMARKS_PREFIX}/{color}.json"
    try:
        obj = s3.s3.get_object(Bucket=s3.BUCKET, Key=key)
    except ClientError as e:
        logger.info(f"No TM benchmarks for {color} at s3://{s3.BUCKET}/{key}: {e.response['Error'].get('Code')}")
        return {}
    try:
        payload = json.loads(obj["Body"].read().decode("utf-8"))
        return payload.get("benchmarks", {}) or {}
    except (ValueError, KeyError) as e:
        logger.warning(f"Failed to parse TM benchmarks for {color}: {e}")
        return {}


def _benchmarks_for_color(color: str) -> dict[str, int]:
    if color not in _attempted:
        _cache[color] = _load_color(color)
        _attempted.add(color)
    return _cache.get(color, {})


def get_travel_time_benchmark(route_id: str, from_stop: str, to_stop: str) -> Optional[int]:
    """Return the TM travel-time benchmark in seconds, or None if unavailable."""
    color = ROUTE_ID_TO_COLOR.get(route_id)
    if color is None:
        return None
    return _benchmarks_for_color(color).get(f"{from_stop}|{to_stop}")

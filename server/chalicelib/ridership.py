"""Ridership data retrieval from DynamoDB and S3."""

import json
import re
from datetime import date
from typing import Dict, List, TypedDict

from botocore.exceptions import ClientError

from . import s3
from .dynamo import query_ridership, query_station_ridership

BUS_STOP_RIDERSHIP_PREFIX = "BusStopRidership"
# GTFS bus route IDs are short and alphanumeric (e.g. "28", "34E", "741"), which keeps the S3 key well formed
BUS_ROUTE_ID_REGEX = re.compile(r"^[A-Za-z0-9]{1,10}$")


class RidershipEntry(TypedDict):
    """A single ridership data point for a line on a given date.

    Attributes:
        date: The date of the ridership measurement in ``"YYYY-MM-DD"`` format.
        count: The total ridership count for the line on that date.
    """

    date: str
    count: int


def get_ridership(
    line_id: str,
    start_date: date,
    end_date: date,
) -> List[RidershipEntry]:
    """Retrieve ridership counts for a line over a date range from DynamoDB.

    Args:
        line_id: The line identifier to query (e.g. ``"line-red"``).
        start_date: The first date of the range (inclusive).
        end_date: The last date of the range (inclusive).

    Returns:
        A list of ``RidershipEntry`` dicts, each with ``date`` and ``count`` keys.
    """
    query_results = query_ridership(
        start_date=start_date,
        end_date=end_date,
        line_id=line_id,
    )
    results = []
    for result in query_results:
        results.append({"date": result["date"], "count": result["count"]})
    return results


class StationRidershipEntry(TypedDict):
    """Ridership at each gated station on a line for one week.

    Attributes:
        date: The week's Monday in ``"YYYY-MM-DD"`` format.
        stations: Average peak-day fare validations, keyed by parent stop ID (e.g. ``"place-pktrm"``).
    """

    date: str
    stations: Dict[str, int]


def get_station_ridership(
    line_id: str,
    start_date: date,
    end_date: date,
) -> List[StationRidershipEntry]:
    """Retrieve weekly ridership for each gated station on a line over a date range.

    Args:
        line_id: The line identifier to query (e.g. ``"line-Red"``).
        start_date: The first date of the range (inclusive).
        end_date: The last date of the range (inclusive).

    Returns:
        A list of ``StationRidershipEntry`` dicts, one per week.
    """
    query_results = query_station_ridership(
        start_date=start_date,
        end_date=end_date,
        line_id=line_id,
    )
    return [{"date": result["date"], "stations": result["stations"]} for result in query_results]


def get_bus_stop_ridership(route_id: str) -> dict:
    """Retrieve a bus route's average weekday boardings and alightings at each stop, for each fall season.

    data-ingestion writes one file per route to S3 from the MBTA's seasonal ridership counts, so this doesn't take
    a date range.

    Args:
        route_id: The GTFS route ID (e.g. ``"28"`` or ``"741"``).

    Returns:
        The route's file, or one with no seasons if the MBTA's data doesn't cover the route.
    """
    try:
        return json.loads(s3.download(f"{BUS_STOP_RIDERSHIP_PREFIX}/{route_id}.json", compressed=False))
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") not in ("NoSuchKey", "404"):
            raise
        return {"route_id": route_id, "seasons": [], "stop_names": {}}

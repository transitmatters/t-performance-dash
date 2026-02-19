"""Ridership data retrieval from DynamoDB."""

from datetime import date
from typing import List, TypedDict

from .dynamo import query_ridership


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

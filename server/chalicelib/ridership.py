from datetime import date
from typing import List, TypedDict

from .dynamo import query_ridership


class RidershipEntry(TypedDict):
    date: str
    count: int


def get_ridership(
    line_id: str,
    start_date: date,
    end_date: date,
) -> List[RidershipEntry]:
    query_results = query_ridership(
        start_date=start_date,
        end_date=end_date,
        line_id=line_id,
    )
    results = []
    for result in query_results:
        results.append({"date": result["date"], "count": result["count"]})
    return results

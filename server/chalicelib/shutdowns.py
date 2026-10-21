"""Shutdowns (shuttles, suspensions, station closures) on a line over a date range.

data-ingestion indexes these alerts from the LAMP alert history into the Shutdowns
DynamoDB table, one item per (line, alert).
"""

from datetime import date

from chalice import BadRequestError

from chalicelib import dynamo
from chalicelib.delays import VALID_LINES

GREEN_BRANCHES = ["Green-B", "Green-C", "Green-D", "Green-E"]


def get_shutdowns(line: str, start_date: date, end_date: date) -> list[dict]:
    """Fetch the shutdowns on a line that overlap a date range.

    Args:
        line: Line identifier (e.g. ``Red``, ``Green-B``, ``CR-Fairmount``). ``Green`` covers every branch.
        start_date: Start of date range (inclusive).
        end_date: End of date range (inclusive).

    Returns:
        Shutdowns sorted by start date. An alert on several Green branches appears once.

    Raises:
        BadRequestError: If the line is not supported.
    """
    lines = GREEN_BRANCHES if line == "Green" else [line]
    if not set(lines) <= set(VALID_LINES):
        raise BadRequestError("Invalid Line key.")

    by_alert = {}
    for branch in lines:
        for item in dynamo.query_shutdowns(branch, start_date, end_date):
            if item["alert_id"] in by_alert:
                by_alert[item["alert_id"]]["stops"] = sorted(
                    set(by_alert[item["alert_id"]]["stops"]) | set(item["stops"])
                )
            else:
                by_alert[item["alert_id"]] = {**item, "line": line}
    return sorted(by_alert.values(), key=lambda item: (item["first_start"], item["alert_id"]))

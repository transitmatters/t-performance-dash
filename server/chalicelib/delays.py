"""Alert-based delay calculations for transit lines.

Queries DynamoDB for daily or weekly alert delay data and validates
request parameters and date ranges.
"""

from typing import TypedDict
from chalice import BadRequestError
from chalicelib import dynamo
from datetime import date


# Config map for daily vs weekly delay queries
AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "AlertDelaysDaily"},
    "weekly": {"table_name": "AlertDelaysWeekly"},
}


class AlertDelaysByLineParams(TypedDict):
    """Parameters for alert delay queries.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        line: Line identifier (e.g., ``Red``, ``Green-B``, ``CR-Fairmount``).
        agg: Aggregation level — ``"daily"`` or ``"weekly"``.
    """

    start_date: str | date
    end_date: str | date
    line: str
    agg: str


def delay_time_by_line(params: AlertDelaysByLineParams):
    """Fetch alert-based delay data for a transit line.

    Validates the line identifier and date range, then queries the appropriate
    DynamoDB table (daily or weekly) for delay data.

    Args:
        params: Query parameters including start_date, end_date, line, and agg.

    Returns:
        List of delay records from DynamoDB.

    Raises:
        BadRequestError: If the line or aggregation type is invalid, or parameters are missing.
    """
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        line = params["line"]
        agg = params.get("agg", "weekly")  # Default to weekly if not specified
        config = AGG_TO_CONFIG_MAP.get(agg)
        if not config:
            raise BadRequestError("Invalid aggregation type. Must be 'daily' or 'weekly'.")
        valid_lines = [
            "Red",
            "Blue",
            "Orange",
            "Green-B",
            "Green-C",
            "Green-D",
            "Green-E",
            "Mattapan",
            "CR-Fairmount",
            "CR-Fitchburg",
            "CR-Worcester",
            "CR-Franklin",
            "CR-Greenbush",
            "CR-Haverhill",
            "CR-Kingston",
            "CR-Lowell",
            "CR-Middleborough",
            "CR-NewBedford",
            "CR-Needham",
            "CR-Newburyport",
            "CR-Providence",
        ]
        if line not in valid_lines:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    # Return the query from the appropriate table
    return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], line)

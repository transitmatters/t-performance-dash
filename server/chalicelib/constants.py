EVENT_ARRIVAL = ["ARR", "PRA"]
EVENT_DEPARTURE = ["DEP", "PRD"]

LINE_TO_ROUTE_MAP = {
    "line-red": ["line-red-a", "line-red-b"],
    "line-green": ["line-green-b", "line-green-c", "line-green-d", "line-green-e"],
    "line-blue": ["line-blue"],
    "line-orange": ["line-orange"],
}

# Most recent date for which we have official MBTA data in S3
# TODO: Fetch this date from S3 automatically
BUS_MAX_DATE = "2023-10-31"

from chalice import BadRequestError, ForbiddenError
from chalicelib import dynamo
from datetime import datetime, timedelta

# Delta values put limits on the numbers of days for which data that can be requested. For each table it is approximately 150 entries.
AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "DailySpeed", "delta": 150},
    "weekly": {"table_name": "WeeklySpeed", "delta": 7 * 150},
    "monthly": {"table_name": "MonthlySpeed", "delta": 30 * 150},
}

DATE_FORMAT_BACKEND = "%Y-%m-%d"


def get_speeds(params):
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        config = AGG_TO_CONFIG_MAP[params["agg"]]
        line = params["line"]
        if line not in ["line-red", "line-blue", "line-green", "line-orange"]:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    start_datetime = datetime.strptime(start_date, DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(end_date, DATE_FORMAT_BACKEND)
    if start_datetime + timedelta(days=config["delta"]) < end_datetime:
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    return dynamo.query_speed_tables(config["table_name"], line, start_date, end_date)

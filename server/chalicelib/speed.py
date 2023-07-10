from chalice import BadRequestError, ForbiddenError
from chalicelib import dynamo
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Delta values put limits on the numbers of days for which data that can be requested. For each table it is approximately 150 entries.
AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "DeliveredTripMetrics", "delta": 150},
    "weekly": {"table_name": "DeliveredTripMetricsWeekly", "delta": 7 * 150},
    "monthly": {"table_name": "DeliveredTripMetricsMonthly", "delta": 30 * 150},
}

# Delete this once GL speeds are done.
OLD_AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "DailySpeed", "delta": 150},
    "weekly": {"table_name": "WeeklySpeed", "delta": 7 * 150},
    "monthly": {"table_name": "MonthlySpeed", "delta": 30 * 150},
}


DATE_FORMAT_BACKEND = "%Y-%m-%d"


def aggregate_actual_trips(actual_trips, agg, start_date):
    flat_data = [entry for sublist in actual_trips for entry in sublist]
    # Create a DataFrame from the flattened data
    df = pd.DataFrame(flat_data)
    # Set miles_covered to NaN for each date with any entry having miles_covered as nan
    df.loc[df.groupby('date')['miles_covered'].transform(lambda x: (np.isnan(x)).any()), ['count', 'total_time', 'miles_covered']] = np.nan
    # Group each branch into one entry. Keep NaN entries as NaN
    df_grouped = df.groupby('date').agg({'miles_covered': 'sum', 'total_time': 'sum', 'count': 'sum', 'line': 'first'}).reset_index()
    # set index to use datetime object.
    df_grouped.set_index(pd.to_datetime(df_grouped['date']), inplace=True)
    return df_grouped.to_dict(orient='records')


def trip_metrics_by_line(params):
    """
    Get trip metrics grouped by line. The weekly and monthly dbs are already aggregated by line.
    The daily db is not, and gets aggregated on the fly.
    """
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        config = AGG_TO_CONFIG_MAP[params["agg"]]
        line = params["line"]
        if line not in ["line-red", "line-blue", "line-green", "line-orange"]:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    # Prevent queries of more than 150 items.
    if is_invalid_range(start_date, end_date, config["delta"]):
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    # If querying for daily data, query then aggregate.
    if params["agg"] == "daily":
        actual_trips = dynamo.query_daily_trips_on_line(config["table_name"], line, start_date, end_date)
        return aggregate_actual_trips(actual_trips, params["agg"], params["start_date"])
    # If querying for weekly/monthly data, can just return the query.
    return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], line)


def is_invalid_range(start_date, end_date, max_delta):
    '''Check if number of requested entries is more than maximum for the table'''
    start_datetime = datetime.strptime(start_date, DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(end_date, DATE_FORMAT_BACKEND)
    return start_datetime + timedelta(days=max_delta) < end_datetime


def get_speeds(params):
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        config = OLD_AGG_TO_CONFIG_MAP[params["agg"]]
        line = params["line"]
        if line not in ["line-red", "line-blue", "line-green", "line-orange"]:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    start_datetime = datetime.strptime(start_date, DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(end_date, DATE_FORMAT_BACKEND)
    if start_datetime + timedelta(days=config["delta"]) < end_datetime:
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    return dynamo.old_query_speed_tables(config["table_name"], line, start_date, end_date)

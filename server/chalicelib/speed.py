from calendar import week
from cmath import nan
from tokenize import group
from tracemalloc import start
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

DATE_FORMAT_BACKEND = "%Y-%m-%d"

def aggregate_actual_trips(actual_trips, agg, start_date):
    flat_data = [entry for sublist in actual_trips for entry in sublist]
    # Create a DataFrame from the flattened data
    df = pd.DataFrame(flat_data)

    # Set miles_covered to NaN for each date with any entry having miles_covered as nan
    df.loc[df.groupby('date')['miles_covered'].transform(lambda x: (np.isnan(x)).any()), ['count','total_time','miles_covered']] = np.nan

    df_grouped = df.groupby('date').agg({'miles_covered': 'sum', 'total_time': 'sum', 'count':'sum', 'line': 'first'}).reset_index()

    df_grouped.set_index(pd.to_datetime(df_grouped['date']), inplace=True)
    df_grouped.drop('date', axis=1, inplace=True)
    
    
    if agg == 'daily':
        df_grouped['date'] = df_grouped.index.strftime('%Y-%m-%d')
        return df_grouped.to_dict(orient='records')
    df_grouped.index = pd.to_datetime(df_grouped.index)
    df_grouped.replace(0, np.nan, inplace=True)
    if agg == 'weekly':
        # Grouped from Monday - Sunday. Pandas resample uses the end date - we subtract 6 days to convert to start date. TODO: Is this right? Also I don't think convention='start' is doing anything.
        weekly_df = df_grouped.resample('W-SUN').agg({'miles_covered': np.sum, 'count': np.nanmedian, 'total_time':np.sum, 'line':'min'})
        weekly_df = weekly_df.fillna(0)
        weekly_df.index = weekly_df.index-pd.Timedelta(days=6)
        # Drop the first week if it is incomplete
        if datetime.fromisoformat(start_date).weekday() != 0:
            weekly_df = weekly_df.tail(-1)
        weekly_df['date'] = weekly_df.index.strftime('%Y-%m-%d')
        return weekly_df.to_dict(orient='records')

    if agg == 'monthly':
        monthly_df = df_grouped.resample('M').agg({'miles_covered': np.sum, 'count': np.nanmedian, 'total_time':np.sum, 'line':'min'})
        monthly_df = monthly_df.fillna(0)
        # Drop the first week if it is incomplete
        monthly_df.index = [pd.datetime(x.year, x.month, 1) for x in monthly_df.index.tolist()] 
        if datetime.fromisoformat(start_date).day != 1:
            monthly_df = monthly_df.tail(-1)
        monthly_df['date'] = monthly_df.index.strftime('%Y-%m-%d')
        return monthly_df.to_dict(orient='records')
        
    return_data = df_grouped.reset_index()
    return return_data.to_dict(orient='records')



def trip_metrics_by_line(params):
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        config = AGG_TO_CONFIG_MAP[params["agg"]]
        line = params["line"]
        if line not in ["line-red", "line-blue", "line-green", "line-orange"]:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    if is_invalid_range(start_date, end_date, config["delta"]):
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    if params["agg"] == "daily":
        actual_trips =  dynamo.query_daily_trips_on_line(config["table_name"], line, start_date, end_date)
        return aggregate_actual_trips(actual_trips, params["agg"], params["start_date"])
    return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], line)



def is_invalid_range(start_date, end_date, max_delta):
    start_datetime = datetime.strptime(start_date, DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(end_date, DATE_FORMAT_BACKEND)
    return start_datetime + timedelta(days=max_delta) < end_datetime
import datetime
from chalicelib import data_funcs
import pandas as pd
from pandas.core.groupby.generic import DataFrameGroupBy
from pandas.tseries.holiday import USFederalHolidayCalendar
import numpy as np

# This matches the cutoff used in MbtaPerformanceApi.py
SERVICE_HR_OFFSET = datetime.timedelta(hours=3, minutes=30)


def train_peak_status(df: pd.DataFrame):
    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=df["dep_dt"].min(), end=df["dep_dt"].max())
    # pandas has a bug where sometimes empty holidays returns an Index and we need DateTimeIndex
    holidays = pd.to_datetime(holidays)
    df["holiday"] = df["service_date"].isin(holidays.date)

    # Peak Hours: non-holiday weekdays 6:30-9am; 3:30-6:30pm
    is_peak_day = (~df["holiday"]) & (df["weekday"] < 5)
    df["is_peak_day"] = is_peak_day
    conditions = [
        is_peak_day & (df["dep_time"].between(datetime.time(6, 30), datetime.time(9, 0))),
        is_peak_day & (df["dep_time"].between(datetime.time(15, 30), datetime.time(18, 30))),
    ]
    choices = ["am_peak", "pm_peak"]
    df["peak"] = np.select(conditions, choices, default="off_peak")
    return df


def faster_describe(grouped: DataFrameGroupBy):
    # This does the same thing as pandas.DataFrame.describe(), but is up to 25x faster!
    # also, we can specify population std instead of sample.
    stats = grouped.aggregate(["count", "mean", "min", "median", "max", "sum"])
    std = grouped.std(ddof=0)
    q1 = grouped.quantile(0.25)
    q3 = grouped.quantile(0.75)
    std.name = "std"
    q1.name = "25%"
    q3.name = "75%"
    # TODO: we can take this out if we filter for 'median' in the front end
    stats.rename(columns={"median": "50%"}, inplace=True)
    stats = pd.concat([stats, q1, q3, std], axis=1).reset_index()

    # This will filter out some probable outliers.
    return stats.loc[stats["count"] > 4]


####################
# TRAVEL TIMES
####################
# `aggregate_traveltime_data` will fetch and clean the data
# There are `calc_travel_times_by_date` and `calc_travel_times_by_time` will use the data to aggregate in various ways
# `travel_times_all` will return all calculated aggregates
# `travel_times_over_time` is legacy and returns just the by_date aggregation w/ peak == all


def aggregate_traveltime_data(start_date: datetime.date, end_date: datetime.date, from_stops, to_stops):
    all_data = data_funcs.travel_times(start_date, from_stops, to_stops, end_date)
    if not all_data:
        return None

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df["dep_dt"] = pd.to_datetime(df["dep_dt"])
    df["dep_time"] = df["dep_dt"].dt.time

    # label service date
    service_date = df["dep_dt"] - SERVICE_HR_OFFSET
    df["service_date"] = service_date.dt.date
    df["weekday"] = service_date.dt.dayofweek
    df = train_peak_status(df)

    return df


def calc_travel_times_by_time(df: pd.DataFrame):
    # convert time of day to a consistent datetime relative to epoch
    timedeltas = pd.to_timedelta(df["dep_time"].astype(str))
    timedeltas.loc[timedeltas < SERVICE_HR_OFFSET] += datetime.timedelta(days=1)
    df["dep_time_from_epoch"] = timedeltas + datetime.datetime(1970, 1, 1)

    stats = faster_describe(df.groupby("is_peak_day").resample("30T", on="dep_time_from_epoch")["travel_time_sec"])
    stats["dep_time_from_epoch"] = stats["dep_time_from_epoch"].dt.strftime("%Y-%m-%dT%H:%M:%S")

    return stats


def calc_travel_times_by_date(df: pd.DataFrame):
    # get summary stats
    summary_stats = faster_describe(df.groupby("service_date")["travel_time_sec"])
    summary_stats["peak"] = "all"

    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(["service_date", "peak"])["travel_time_sec"])

    # combine summary stats
    summary_stats_final = pd.concat([summary_stats, summary_stats_peak])

    return summary_stats_final


def travel_times_all(start_date: datetime.date, end_date: datetime.date, from_stops, to_stops):
    df = aggregate_traveltime_data(start_date, end_date, from_stops, to_stops)
    if df is None:
        return {"by_date": [], "by_time": []}
    by_date = calc_travel_times_by_date(df)
    by_time = calc_travel_times_by_time(df)

    return {
        "by_date": by_date.to_dict("records"),
        "by_time": by_time.to_dict("records"),
    }


def travel_times_over_time(start_date: datetime.date, end_date: datetime.date, from_stops, to_stops):
    df = aggregate_traveltime_data(start_date, end_date, from_stops, to_stops)
    if df is None:
        return []
    stats = calc_travel_times_by_date(df)
    return stats.loc[stats["peak"] == "all"].to_dict("records")


####################
# HEADWAYS
####################
def headways_over_time(start_date: datetime.date, end_date: datetime.date, stops):
    all_data = data_funcs.headways(start_date, stops, end_date)
    if not all_data:
        return []

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df["dep_dt"] = pd.to_datetime(df["current_dep_dt"])
    df["dep_time"] = df["dep_dt"].dt.time

    # label service date
    service_date = df["dep_dt"] - SERVICE_HR_OFFSET
    df["service_date"] = service_date.dt.date
    df["weekday"] = service_date.dt.dayofweek
    df = train_peak_status(df)

    # get summary stats
    summary_stats = faster_describe(df.groupby("service_date")["headway_time_sec"])
    summary_stats["peak"] = "all"

    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(["service_date", "peak"])["headway_time_sec"])

    # combine summary stats
    summary_stats_final = pd.concat([summary_stats, summary_stats_peak])

    grouped = df.groupby("service_date")
    # Calculate the ratio of headway_time_sec to benchmark_headway_time_sec
    df["benchmark_headway_time_sec"] = df["benchmark_headway_time_sec"].astype(float)
    df["headway_ratio"] = df["headway_time_sec"] / df["benchmark_headway_time_sec"]

    # Calculate the count of trips under 0.5 (bunched) per service_date
    bunched = grouped.apply(lambda x: (x["headway_ratio"] <= 0.5).sum())
    bunched.name = "bunched"
    summary_stats_final = summary_stats_final.merge(bunched, on="service_date", how="left")

    # Calculate the count of trips between 0.75 and 1.25 (on-time) per service_date
    on_time = grouped.apply(lambda x: ((x["headway_ratio"] < 1.25) & (x["headway_ratio"] > 0.75)).sum())
    on_time.name = "on_time"
    summary_stats_final = summary_stats_final.merge(on_time, on="service_date", how="left")

    # filter peak status
    results = summary_stats_final.loc[summary_stats_final["peak"] == "all"]
    # convert to dictionary
    return results.to_dict("records")


def dwells_over_time(start_date: str | datetime.date, end_date: str | datetime.date, stops):
    all_data = data_funcs.dwells(start_date, stops, end_date)
    if not all_data:
        return []

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df["dep_dt"] = pd.to_datetime(df["dep_dt"])
    df["dep_time"] = df["dep_dt"].dt.time

    # label service date
    service_date = df["dep_dt"] - SERVICE_HR_OFFSET
    df["service_date"] = service_date.dt.date
    df["weekday"] = service_date.dt.dayofweek
    df = train_peak_status(df)

    # get summary stats
    summary_stats = faster_describe(df.groupby("service_date")["dwell_time_sec"])
    summary_stats["peak"] = "all"

    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(["service_date", "peak"])["dwell_time_sec"])

    # combine summary stats
    summary_stats_final = pd.concat([summary_stats, summary_stats_peak])

    # filter peak status
    results = summary_stats_final.loc[summary_stats_final["peak"] == "all"]
    # convert to dictionary
    return results.to_dict("records")

import datetime
from chalicelib import data_funcs
import pandas as pd
from pandas.core.groupby.generic import DataFrameGroupBy
import numpy as np
from pandas.tseries.holiday import USFederalHolidayCalendar

# This matches the cutoff used in MbtaPerformanceApi.py
SERVICE_HR_OFFSET = datetime.timedelta(hours=3, minutes=30)


def add_holidays(
    df: pd.DataFrame,
    holiday_col_name: str = "holiday",
    service_date_col_name: str = "service_date",
) -> pd.DataFrame:
    """Add a boolean column indicating whether each row's date is a US federal holiday.

    Args:
        df: DataFrame containing a date column to check against holidays.
        holiday_col_name: Name of the boolean column to add. Defaults to "holiday".
        service_date_col_name: Name of the existing date column to check. Defaults to "service_date".

    Returns:
        The input DataFrame with an added boolean holiday column.
    """
    # Handle empty DataFrame or missing dates
    if df.empty or df[service_date_col_name].isna().all():
        df[holiday_col_name] = False
        return df

    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=df[service_date_col_name].min(), end=df[service_date_col_name].max())
    # pandas has a bug where sometimes empty holidays returns an Index and we need DateTimeIndex
    holidays = pd.to_datetime(holidays)
    df[holiday_col_name] = df[service_date_col_name].isin(holidays.date)
    return df


def train_peak_status(df: pd.DataFrame):
    """Classify each trip as AM peak, PM peak, or off-peak based on departure time.

    Peak hours are defined as non-holiday weekdays 6:30-9:00 AM (am_peak) and
    3:30-6:30 PM (pm_peak). All other times are labeled off_peak.

    Args:
        df: DataFrame with "dep_time" and "weekday" columns.

    Returns:
        The input DataFrame with added "holiday", "is_peak_day", and "peak" columns.
    """
    df = add_holidays(df)

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
    """Compute descriptive statistics for a grouped DataFrame, optimized for speed.

    Equivalent to pandas DataFrame.describe() but up to 25x faster. Computes count,
    mean, min, median (as "50%"), max, sum, std (population), 25th, and 75th percentiles.
    Filters out groups with 4 or fewer observations to reduce outlier noise.

    Args:
        grouped: A grouped single-column DataFrame to compute statistics on.

    Returns:
        DataFrame with descriptive statistics per group, excluding groups with count <= 4.
    """
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
    """Fetch and prepare travel time data for aggregation.

    Retrieves raw travel time records, converts them to a DataFrame, and enriches
    with service date, weekday, and peak status columns.

    Args:
        start_date: Start of the date range (inclusive).
        end_date: End of the date range (inclusive).
        from_stops: Origin stop ID(s) for the travel time query.
        to_stops: Destination stop ID(s) for the travel time query.

    Returns:
        Enriched DataFrame with travel time data, or None if no data is available.
    """
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
    """Aggregate travel times into 30-minute time-of-day buckets, split by peak day status.

    Converts departure times to epoch-relative datetimes for resampling, then computes
    descriptive statistics for each 30-minute interval.

    Args:
        df: DataFrame from aggregate_traveltime_data with "dep_time", "is_peak_day",
            and "travel_time_sec" columns.

    Returns:
        DataFrame with travel time statistics per 30-minute bucket and peak day status.
    """
    # convert time of day to a consistent datetime relative to epoch
    timedeltas = pd.to_timedelta(df["dep_time"].astype(str))
    timedeltas.loc[timedeltas < SERVICE_HR_OFFSET] += datetime.timedelta(days=1)
    df["dep_time_from_epoch"] = timedeltas + datetime.datetime(1970, 1, 1)

    stats = faster_describe(df.groupby("is_peak_day").resample("30min", on="dep_time_from_epoch")["travel_time_sec"])
    stats["dep_time_from_epoch"] = stats["dep_time_from_epoch"].dt.strftime("%Y-%m-%dT%H:%M:%S")

    return stats


def calc_travel_times_by_date(df: pd.DataFrame):
    """Aggregate travel times by service date, with overall and per-peak-period breakdowns.

    Computes descriptive statistics grouped by service date for all trips combined
    (peak="all") and separately by peak status (am_peak, pm_peak, off_peak).
    Adds holiday and weekend flags to the results.

    Args:
        df: DataFrame from aggregate_traveltime_data with "service_date", "peak",
            and "travel_time_sec" columns.

    Returns:
        DataFrame with travel time statistics per service date and peak period.
    """
    # get summary stats
    summary_stats = faster_describe(df.groupby("service_date")["travel_time_sec"])
    summary_stats["peak"] = "all"

    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(["service_date", "peak"])["travel_time_sec"])

    # combine summary stats
    summary_stats_final = pd.concat([summary_stats, summary_stats_peak])

    summary_stats_final = add_holidays(summary_stats_final)

    # Calculate Weekend
    # Convert service_date back to datetime to use .dt accessor
    summary_stats_final["weekend"] = pd.to_datetime(summary_stats_final["service_date"]).dt.dayofweek.isin([5, 6])

    return summary_stats_final


def travel_times_all(start_date: datetime.date, end_date: datetime.date, from_stops, to_stops):
    """Return travel time aggregations both by date and by time of day.

    Args:
        start_date: Start of the date range (inclusive).
        end_date: End of the date range (inclusive).
        from_stops: Origin stop ID(s).
        to_stops: Destination stop ID(s).

    Returns:
        Dict with "by_date" and "by_time" keys, each containing a list of records.
        Returns empty lists for both if no data is available.
    """
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
    """Return travel time statistics by date for all peak periods combined.

    Legacy endpoint that returns only the by-date aggregation filtered to peak="all".

    Args:
        start_date: Start of the date range (inclusive).
        end_date: End of the date range (inclusive).
        from_stops: Origin stop ID(s).
        to_stops: Destination stop ID(s).

    Returns:
        List of record dicts with daily travel time statistics, or empty list if no data.
    """
    df = aggregate_traveltime_data(start_date, end_date, from_stops, to_stops)
    if df is None:
        return []
    stats = calc_travel_times_by_date(df)
    return stats.loc[stats["peak"] == "all"].to_dict("records")


####################
# HEADWAYS
####################
def headways_over_time(start_date: datetime.date, end_date: datetime.date, stops):
    """Compute daily headway statistics with bunching and on-time metrics.

    Fetches headway data, computes descriptive statistics by service date, and
    calculates bunched (headway ratio <= 0.5) and on-time (ratio between 0.75
    and 1.25) trip counts relative to benchmark headways. Results are filtered
    to the "all" peak category and include holiday/weekend flags.

    Args:
        start_date: Start of the date range (inclusive).
        end_date: End of the date range (inclusive).
        stops: Stop ID(s) to query headways for.

    Returns:
        List of record dicts with daily headway statistics, or empty list if no data.
    """
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
    df["benchmark_headway_time_sec"] = pd.to_numeric(df["benchmark_headway_time_sec"], errors="coerce")
    df["headway_ratio"] = df["headway_time_sec"] / df["benchmark_headway_time_sec"]

    # Calculate the count of trips under 0.5 (bunched) per service_date
    bunched = grouped.apply(lambda x: (x["headway_ratio"] <= 0.5).sum())
    bunched.name = "bunched"
    summary_stats_final = summary_stats_final.merge(bunched, on="service_date", how="left")

    # Calculate the count of trips between 0.75 and 1.25 (on-time) per service_date
    on_time = grouped.apply(lambda x: ((x["headway_ratio"] < 1.25) & (x["headway_ratio"] > 0.75)).sum())
    on_time.name = "on_time"
    summary_stats_final = summary_stats_final.merge(on_time, on="service_date", how="left")

    summary_stats_final = add_holidays(summary_stats_final)

    # Calculate Weekend
    # Convert service_date back to datetime to use .dt accessor
    summary_stats_final["weekend"] = pd.to_datetime(summary_stats_final["service_date"]).dt.dayofweek.isin([5, 6])

    # filter peak status
    results = summary_stats_final.loc[summary_stats_final["peak"] == "all"]
    # convert to dictionary
    return results.to_dict("records")


def dwells_over_time(start_date: str | datetime.date, end_date: str | datetime.date, stops):
    """Compute daily dwell time statistics over a date range.

    Fetches dwell time data, computes descriptive statistics by service date for
    all trips and by peak period, then returns results filtered to the "all"
    peak category with holiday and weekend flags.

    Args:
        start_date: Start of the date range (inclusive).
        end_date: End of the date range (inclusive).
        stops: Stop ID(s) to query dwell times for.

    Returns:
        List of record dicts with daily dwell time statistics, or empty list if no data.
    """
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

    summary_stats_final = add_holidays(summary_stats_final)

    # Calculate Weekend
    # Convert service_date back to datetime to use .dt accessor
    summary_stats_final["weekend"] = pd.to_datetime(summary_stats_final["service_date"]).dt.dayofweek.isin([5, 6])
    # filter peak status
    results = summary_stats_final.loc[summary_stats_final["peak"] == "all"]
    # convert to dictionary
    return results.to_dict("records")

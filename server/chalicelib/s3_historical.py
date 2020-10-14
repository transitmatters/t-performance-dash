from datetime import datetime, timedelta, time
from chalicelib import s3
import pandas as pd
from pandas.tseries.holiday import USFederalHolidayCalendar
import numpy as np
import boto3

DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_OUT = "%Y/%m/%d %H:%M:%S"

EVENT_ARRIVAL = ["ARR", "PRA"]
EVENT_DEPARTURE = ["DEP", "PRD"]
s3_resource = boto3.resource("s3")


def dwells(stop_id, year, month, day):
    rows_by_time = s3.download_sorted_events(stop_id, year, month, day)

    dwells = []
    for i in range(0, len(rows_by_time) - 1):
        maybe_an_arrival = rows_by_time[i]
        maybe_a_departure = rows_by_time[i + 1]
        # Look for all ARR/DEP pairs for same trip id
        if maybe_an_arrival["event_type"] in EVENT_ARRIVAL and maybe_a_departure["event_type"] in EVENT_DEPARTURE and maybe_an_arrival["trip_id"] == maybe_a_departure["trip_id"]:
            dep_dt = datetime.strptime(
                maybe_a_departure["event_time"], DATE_FORMAT_MASSDOT)
            arr_dt = datetime.strptime(
                maybe_an_arrival["event_time"], DATE_FORMAT_MASSDOT)
            delta = dep_dt - arr_dt
            dwells.append({
                "route_id": maybe_a_departure["route_id"],
                "direction": int(maybe_a_departure["direction_id"]),
                "arr_dt": arr_dt.strftime(DATE_FORMAT_OUT),
                "dep_dt": dep_dt.strftime(DATE_FORMAT_OUT),
                "dwell_time_sec": delta.total_seconds()
            })

    return dwells


def headways(stop_id, year, month, day):
    rows_by_time = s3.download_sorted_events(stop_id, year, month, day)

    only_departures = list(
        filter(lambda row: row['event_type'] in EVENT_DEPARTURE, rows_by_time))
    for i in range(1, len(only_departures)):
        this = only_departures[i]
        prev = only_departures[i - 1]

        this_dt = datetime.strptime(this["event_time"], DATE_FORMAT_MASSDOT)
        prev_dt = datetime.strptime(prev["event_time"], DATE_FORMAT_MASSDOT)
        delta = this_dt - prev_dt

        only_departures[i]["headway_time_sec"] = delta.total_seconds()

    # The first departure of the day has no headway..
    only_departures[0]["headway_time_sec"] = 0

    # Mapping here so we only send back what the MBTA Performance API usually does
    return list(map(lambda departure: {
        "route_id": departure["route_id"],
        "direction": int(departure["direction_id"]),
        "current_dep_dt": departure["event_time"],
        "headway_time_sec": departure["headway_time_sec"],
        "benchmark_headway_time_sec": None
    }, only_departures))

# For a given trip ID and a list of events, find when that trip ARR'ed


def find_trip_id_arrival(trip_id, event_list):
    arrival = list(filter(
        lambda event: event["trip_id"] == trip_id and event["event_type"] in EVENT_ARRIVAL, event_list))
    if len(arrival) == 1:
        return arrival[0]["event_time"]
    else:
        return None


def travel_times(stop_a, stop_b, year, month, day):
    rows_by_time_a = s3.download_sorted_events(stop_a, year, month, day)
    rows_by_time_b = s3.download_sorted_events(stop_b, year, month, day)

    only_departures = list(
        filter(lambda event: event["event_type"] in EVENT_DEPARTURE, rows_by_time_a))
    travel_times = []
    for departure in only_departures:
        dep = departure["event_time"]
        arr = find_trip_id_arrival(departure["trip_id"], rows_by_time_b)
        if arr is None:
            continue

        dep_dt = datetime.strptime(dep, DATE_FORMAT_MASSDOT)
        arr_dt = datetime.strptime(arr, DATE_FORMAT_MASSDOT)
        delta = arr_dt - dep_dt
        travel_time_sec = delta.total_seconds()

        travel_times.append({
            "route_id": departure["route_id"],
            "direction": int(departure["direction_id"]),
            "dep_dt": dep_dt.strftime(DATE_FORMAT_OUT),
            "arr_dt": arr_dt.strftime(DATE_FORMAT_OUT),
            "travel_time_sec": travel_time_sec,
            "benchmark_travel_time_sec": None
        })

    return travel_times


def train_peak_status(df):
    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=df['dep_dt'].min(), end=df['dep_dt'].max())

    df['holiday'] = df['dep_dt'].dt.date.astype('datetime64').isin(holidays.date)
    df['weekday'] = df['dep_dt'].dt.dayofweek

    conditions = [(df['holiday'] == 0) & (df['weekday'] < 5) & ((df['dep_time'] >= time(6, 30, 0)) & (df['dep_time'] < time(9, 0, 0))),
                  (df['holiday'] == 0) & (df['weekday'] < 5) & ((df['dep_time'] >= time(15, 30, 0)) & (df['dep_time'] < time(18, 30, 0)))
                  ]
    choices = ['am_peak', 'pm_peak']
    df['peak'] = np.select(conditions, choices, default='off_peak')
    return df


def travel_times_over_time(sdate, edate, stop_a, stop_b):
    all_data = []
    delta = edate - sdate       # as timedelta

    # get a range of dates
    for i in range(delta.days + 1):
        today = sdate + timedelta(days=i)
        try:
            data = travel_times(stop_a, stop_b, year=today.year, month=today.month, day=today.day)
            all_data.extend(data)
        except s3_resource.meta.client.exceptions.NoSuchKey:
            print('no data for that date!')

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = pd.to_datetime(df['dep_dt']).dt.time
    df = train_peak_status(df)

    # get summary stats
    # first, summary stats for all
    summary_stats = df.groupby('service_date')['travel_time_sec'].describe()
    summary_stats['peak'] = 'all'
    #  reset_index
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = df.groupby(['service_date', 'peak'])['travel_time_sec'].describe().reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # conver to dict
    summary_stats_dict = summary_stats_final.to_dict('records')
    return summary_stats_dict

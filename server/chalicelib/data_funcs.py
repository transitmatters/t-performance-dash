import datetime
import pytz
from chalicelib import MbtaPerformanceAPI
import pandas as pd
from pandas.tseries.holiday import USFederalHolidayCalendar
import numpy as np

DATE_FORMAT = "%Y/%m/%d %H:%M:%S"


def stamp_to_dt(stamp):
    return datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))


def headways(day, params):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(day, "headways", params)

    # combine all headways data
    headways = []
    for dict_data in api_data:
        headways = headways + dict_data.get('headways', [])

    # conversion
    for headway_dict in headways:
        # convert to datetime
        headway_dict["current_dep_dt"] = stamp_to_dt(
            int(headway_dict.get("current_dep_dt"))
        ).strftime(DATE_FORMAT)
        headway_dict["previous_dep_dt"] = stamp_to_dt(
            int(headway_dict.get("previous_dep_dt"))
        ).strftime(DATE_FORMAT)
        # convert to int
        headway_dict["benchmark_headway_time_sec"] = int(
            headway_dict.get("benchmark_headway_time_sec")
        )
        headway_dict["headway_time_sec"] = int(headway_dict.get("headway_time_sec"))
        headway_dict["direction"] = int(headway_dict.get("direction"))

    return headways


def travel_times(day, params):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(day, "traveltimes", params)

    # combine all travel times data
    travel = []
    for dict_data in api_data:
        travel = travel + dict_data.get('travel_times', [])

    # conversion
    for travel_dict in travel:
        # convert to datetime
        travel_dict["arr_dt"] = stamp_to_dt(
            int(travel_dict.get("arr_dt"))
        ).strftime(DATE_FORMAT)
        travel_dict["dep_dt"] = stamp_to_dt(
            int(travel_dict.get("dep_dt"))
        ).strftime(DATE_FORMAT)
        # convert to int
        travel_dict["benchmark_travel_time_sec"] = int(
            travel_dict.get("benchmark_travel_time_sec")
        )
        travel_dict["travel_time_sec"] = int(travel_dict.get("travel_time_sec"))
        travel_dict["direction"] = int(travel_dict.get("direction"))

    return travel


def dwells(day, params):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(day, "dwells", params)

    # combine all travel times data
    dwells = []
    for dict_data in api_data:
        dwells = dwells + dict_data.get('dwell_times', [])

    # conversion
    for dwell_dict in dwells:
        # convert to datetime
        dwell_dict["arr_dt"] = stamp_to_dt(
            int(dwell_dict.get("arr_dt"))
        ).strftime(DATE_FORMAT)
        dwell_dict["dep_dt"] = stamp_to_dt(
            int(dwell_dict.get("dep_dt"))
        ).strftime(DATE_FORMAT)
        # convert to int
        dwell_dict["dwell_time_sec"] = int(dwell_dict.get("dwell_time_sec"))
        dwell_dict["direction"] = int(dwell_dict.get("direction"))

    return dwells


def alerts(day, params):
    api_data = MbtaPerformanceAPI.get_api_data(day, "pastalerts", params)

    # combine all alerts data
    alert_items = []
    for dict_data in api_data:
        alert_items = alert_items + dict_data.get('past_alerts', [])

    # get data
    flat_alerts = []
    for alert_item in alert_items:
        for alert_version in alert_item["alert_versions"]:
            flat_alerts.append({
                "valid_from": stamp_to_dt(int(alert_version["valid_from"])).strftime(DATE_FORMAT),
                "valid_to": stamp_to_dt(int(alert_version["valid_to"])).strftime(DATE_FORMAT),
                "text": alert_version["header_text"]
            })
    return flat_alerts


def train_peak_status(df):
    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=df['dep_dt'].min(), end=df['dep_dt'].max())

    df['holiday'] = df['dep_dt'].dt.date.astype('datetime64').isin(holidays.date)
    df['weekday'] = df['dep_dt'].dt.dayofweek

    conditions = [(df['holiday'] == 0) & (df['weekday'] < 5) & ((df['dep_time'] >= datetime.time(6, 30, 0)) & (df['dep_time'] < datetime.time(9, 0, 0))),
                  (df['holiday'] == 0) & (df['weekday'] < 5) & ((df['dep_time'] >= datetime.time(15, 30, 0)) & (df['dep_time'] < datetime.time(18, 30, 0)))]
    choices = ['am_peak', 'pm_peak']
    df['peak'] = np.select(conditions, choices, default='off_peak')
    return df


def travel_times_over_time(sdate, edate, params):
    all_data = []
    delta = edate - sdate       # as timedelta

    # get a range of dates
    for i in range(delta.days + 1):
        today = sdate + datetime.timedelta(days=i)
        today_date = datetime.date(year=today.year, month=today.month, day=today.day)
        data = travel_times(day=today_date, params=params)
        for data_dict in data:
            data_dict['service_date'] = today_date
        all_data = all_data+data

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = pd.to_datetime(df['dep_dt']).dt.time
    df = train_peak_status(df)

    # get summary stats
    summary_stats = df.groupby('service_date')['travel_time_sec'].describe()
    summary_stats['peak'] = 'all'
    # reset_index to turn into dataframe
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = df.groupby(['service_date', 'peak'])['travel_time_sec'].describe().reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # conver to dict
    summary_stats_dict = summary_stats_final.to_dict('records')
    return summary_stats_dict

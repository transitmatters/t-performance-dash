import datetime
from chalicelib import data_funcs
import pandas as pd
from pandas.tseries.holiday import USFederalHolidayCalendar
import numpy as np


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


def travel_times_over_time(sdate, edate, from_stop, to_stop):
    all_data = []
    delta = edate - sdate       # as timedelta

    # get a range of dates
    for i in range(delta.days + 1):
        day = sdate + datetime.timedelta(days=i)
        data = data_funcs.travel_times(day, [from_stop], [to_stop])
        for data_dict in data:
            data_dict['service_date'] = day
        all_data.extend(data)

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

    # convert to dictionary
    summary_stats_dict = summary_stats_final.to_dict('records')
    return list(filter(lambda x: x['peak'] == 'all', summary_stats_dict))

def headways_over_time(sdate, edate, stop):
    all_data = []
    delta = edate - sdate       # as timedelta

    # get a range of dates
    for i in range(delta.days + 1):
        day = sdate + datetime.timedelta(days=i)
        data = data_funcs.headways(day, [stop])
        for data_dict in data:
            data_dict['service_date'] = day
        all_data.extend(data)

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['current_dep_dt'])
    df['dep_time'] = pd.to_datetime(df['current_dep_dt']).dt.time
    df = train_peak_status(df)

    # get summary stats
    summary_stats = df.groupby('service_date')['headway_time_sec'].describe()
    summary_stats['peak'] = 'all'
    # reset_index to turn into dataframe
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = df.groupby(['service_date', 'peak'])['headway_time_sec'].describe().reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # convert to dictionary
    summary_stats_dict = summary_stats_final.to_dict('records')
    return list(filter(lambda x: x['peak'] == 'all', summary_stats_dict))

def dwells_over_time(sdate, edate, stop):
    all_data = []
    delta = edate - sdate       # as timedelta

    # get a range of dates
    for i in range(delta.days + 1):
        day = sdate + datetime.timedelta(days=i)
        data = data_funcs.dwells(day, [stop])
        for data_dict in data:
            data_dict['service_date'] = day
        all_data.extend(data)

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = pd.to_datetime(df['dep_dt']).dt.time
    df = train_peak_status(df)

    # get summary stats
    summary_stats = df.groupby('service_date')['dwell_time_sec'].describe()
    summary_stats['peak'] = 'all'
    # reset_index to turn into dataframe
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = df.groupby(['service_date', 'peak'])['dwell_time_sec'].describe().reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # convert to dictionary
    summary_stats_dict = summary_stats_final.to_dict('records')
    return list(filter(lambda x: x['peak'] == 'all', summary_stats_dict))

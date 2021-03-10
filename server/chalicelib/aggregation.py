import datetime
from chalicelib import data_funcs
import pandas as pd
from pandas.tseries.holiday import USFederalHolidayCalendar
import numpy as np

# This matches the cutoff used in MbtaPerformanceApi.py
SERVICE_HR_OFFSET = datetime.timedelta(hours=3, minutes=30)


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


def faster_describe(grouped):
    # This does the same thing as pandas.DataFrame.describe(), but is up to 25x faster!
    stats = grouped.aggregate(['count', 'mean', 'std', 'min', 'median', 'max'])
    q1 = grouped.quantile(0.25)
    q3 = grouped.quantile(0.75)
    q1.name = '25%'
    q3.name = '75%'
    # TODO: we can take this out if we filter for 'median' in the front end
    stats.rename(columns={'median': '50%'}, inplace=True)
    return pd.concat([stats, q1, q3], axis=1)

def travel_times_over_time(sdate, edate, from_stop, to_stop):
    all_data = data_funcs.travel_times(sdate, [from_stop], [to_stop], edate)

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = df['dep_dt'].dt.time
    df['service_date'] = (df['dep_dt'] - SERVICE_HR_OFFSET).dt.date
    df = train_peak_status(df)

    # get summary stats
    summary_stats = faster_describe(df.groupby('service_date')['travel_time_sec'])
    summary_stats['peak'] = 'all'
    # reset_index to turn into dataframe
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(['service_date', 'peak'])['travel_time_sec']).reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # convert to dictionary
    summary_stats_dict = summary_stats_final.to_dict('records')
    return list(filter(lambda x: x['peak'] == 'all', summary_stats_dict))


def headways_over_time(sdate, edate, stop):
    all_data = data_funcs.headways(sdate, [stop], edate)

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)

    df['dep_dt'] = pd.to_datetime(df['current_dep_dt'])
    df['dep_time'] = df['dep_dt'].dt.time
    df['service_date'] = (df['dep_dt'] - SERVICE_HR_OFFSET).dt.date
    df = train_peak_status(df)

    # get summary stats
    summary_stats = faster_describe(df.groupby('service_date')['headway_time_sec'])
    summary_stats['peak'] = 'all'
    # reset_index to turn into dataframe
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(['service_date', 'peak'])['headway_time_sec']).reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # convert to dictionary
    summary_stats_dict = summary_stats_final.to_dict('records')
    return list(filter(lambda x: x['peak'] == 'all', summary_stats_dict))


def dwells_over_time(sdate, edate, stop):
    all_data = data_funcs.dwells(sdate, [stop], edate)

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = df['dep_dt'].dt.time
    df['service_date'] = (df['dep_dt'] - SERVICE_HR_OFFSET).dt.date
    df = train_peak_status(df)

    # get summary stats
    summary_stats = faster_describe(df.groupby('service_date')['dwell_time_sec'])
    summary_stats['peak'] = 'all'
    # reset_index to turn into dataframe
    summary_stats = summary_stats.reset_index()
    # summary_stats for peak / off-peak trains
    summary_stats_peak = faster_describe(df.groupby(['service_date', 'peak'])['dwell_time_sec']).reset_index()

    # combine summary stats
    summary_stats_final = summary_stats.append(summary_stats_peak)

    # convert to dictionary
    summary_stats_dict = summary_stats_final.to_dict('records')
    return list(filter(lambda x: x['peak'] == 'all', summary_stats_dict))

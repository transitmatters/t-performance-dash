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
    df['holiday'] = df['service_date'].isin(holidays.date)

    # Peak Hours: non-holiday weekdays 6:30-9am; 3:30-6:30pm
    is_peak_day = (~df['holiday']) & (df['weekday'] < 5)
    conditions = [is_peak_day & (df['dep_time'].between(datetime.time(6, 30), datetime.time(9, 0))),
                  is_peak_day & (df['dep_time'].between(datetime.time(15, 30), datetime.time(18, 30)))]
    choices = ['am_peak', 'pm_peak']
    df['peak'] = np.select(conditions, choices, default='off_peak')
    return df


def faster_describe(grouped):
    # This does the same thing as pandas.DataFrame.describe(), but is up to 25x faster!
    # also, we can specify population std instead of sample.
    stats = grouped.aggregate(['count', 'mean', 'min', 'median', 'max'])
    std = grouped.std(ddof=0)
    q1 = grouped.quantile(0.25)
    q3 = grouped.quantile(0.75)
    std.name = 'std'
    q1.name = '25%'
    q3.name = '75%'
    # TODO: we can take this out if we filter for 'median' in the front end
    stats.rename(columns={'median': '50%'}, inplace=True)
    stats = pd.concat([stats, q1, q3, std], axis=1)

    # This will filter out some probable outliers.
    return stats.loc[stats['count'] > 4]


def travel_times_over_time(sdate, edate, from_stop, to_stop):
    all_data = data_funcs.travel_times(sdate, [from_stop], [to_stop], edate)
    if not all_data:
        return []

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = df['dep_dt'].dt.time

    # label service date
    service_date = df['dep_dt'] - SERVICE_HR_OFFSET
    df['service_date'] = service_date.dt.date
    df['weekday'] = service_date.dt.dayofweek
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

    # filter peak status
    results = summary_stats_final.loc[summary_stats_final['peak'] == 'all']
    # convert to dictionary
    return results.to_dict('records')


def headways_over_time(sdate, edate, stop):
    all_data = data_funcs.headways(sdate, [stop], edate)
    if not all_data:
        return []

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['current_dep_dt'])
    df['dep_time'] = df['dep_dt'].dt.time

    # label service date
    service_date = df['dep_dt'] - SERVICE_HR_OFFSET
    df['service_date'] = service_date.dt.date
    df['weekday'] = service_date.dt.dayofweek
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

    # filter peak status
    results = summary_stats_final.loc[summary_stats_final['peak'] == 'all']
    # convert to dictionary
    return results.to_dict('records')


def dwells_over_time(sdate, edate, stop):
    all_data = data_funcs.dwells(sdate, [stop], edate)
    if not all_data:
        return []

    # convert to pandas
    df = pd.DataFrame.from_records(all_data)
    df['dep_dt'] = pd.to_datetime(df['dep_dt'])
    df['dep_time'] = df['dep_dt'].dt.time

    # label service date
    service_date = df['dep_dt'] - SERVICE_HR_OFFSET
    df['service_date'] = service_date.dt.date
    df['weekday'] = service_date.dt.dayofweek
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

    # filter peak status
    results = summary_stats_final.loc[summary_stats_final['peak'] == 'all']
    # convert to dictionary
    return results.to_dict('records')

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
import pandas as pd

from chalicelib import s3
from chalicelib import date_utils


def make_parallel(single_func, THREAD_COUNT=5):
    # This function will wrap another function
    # (similar to a decorator, but we don't want to overwrite the original)
    # e.g. parallel_func = make_parallel(singleton_func)
    # singleton_func's first parameter must be the var to multiplex on
    # and parallel_func will take an iterable in its stead
    def parallel_func(iterable, *args, **kwargs):
        futures = []
        with ThreadPoolExecutor(max_workers=THREAD_COUNT) as executor:
            for i in iterable:
                futures.append(executor.submit(single_func, i, *args, **kwargs))
            as_completed(futures)
        results = [val for future in futures for val in future.result()]
        return results

    return parallel_func


def date_range(start: str, end: str):
    return pd.date_range(start, end)


def s3_date_range(start: date, end: date, stops: list[str]):
    """
    Generates a date range, meant for s3 data
    For all dates that we have monthly datasets for, return 1 date of the month
    For all dates that we have daily datasets for, return all dates
    """
    month_end = end
    if date_utils.get_max_monthly_data_date() < end and date_utils.get_max_monthly_data_date() > start:
        month_end = date_utils.get_max_monthly_data_date()

    date_range = pd.date_range(start, month_end, freq="1D", inclusive="both")

    # are any of the stops CR, if so use daily data only
    cr_data = any([s3.is_cr(stop) for stop in stops])

    # This is kinda funky, but is stil simpler than other approaches
    # pandas won't generate a monthly date_range that includes Jan and Feb for Jan31-Feb1 e.g.
    # So we generate a daily date_range and then resample it down (summing 0s as a no-op in the process) so it aligns.
    if date_utils.get_max_monthly_data_date() > start and not cr_data:
        dates = pd.date_range(start, month_end, freq="1D", inclusive="both")
        series = pd.Series(0, index=dates)
        date_range = series.resample("1ME").sum().index

    # all dates between month_end and end if month_end is less than end
    if pd.to_datetime(month_end) < pd.to_datetime(end):
        daily_dates = pd.date_range(month_end, end, freq="1D", inclusive="both")

        # combine the two date ranges of months and dates
        if daily_dates is not None and len(daily_dates) > 0:
            date_range = date_range.union(daily_dates)

    return date_range

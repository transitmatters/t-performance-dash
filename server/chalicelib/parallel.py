"""Parallel execution utilities for concurrent data fetching.

Provides a wrapper to parallelize single-item functions using ``ThreadPoolExecutor``,
and helper functions for generating date ranges used in S3 queries.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
import pandas as pd

from chalicelib import s3
from chalicelib import date_utils


def make_parallel(single_func, THREAD_COUNT=10):
    """Wrap a single-item function to process an iterable in parallel.

    Creates a new function that calls ``single_func`` concurrently for each
    item in an iterable using a thread pool. The wrapped function's first
    parameter must be the value to multiplex on.

    Args:
        single_func: Function whose first parameter is the item to parallelize over.
        THREAD_COUNT: Maximum number of concurrent threads. Defaults to 10.

    Returns:
        A function that accepts an iterable as its first argument and returns
        a flat list of all results.

    Example:
        ```python
        parallel_download = make_parallel(download_one_event_file)
        all_events = parallel_download(date_list, stop_id)
        ```
    """
    def parallel_func(iterable, *args, **kwargs):
        """Execute single_func in parallel for each item in iterable.

        Args:
            iterable: Items to process in parallel.
            *args: Additional positional arguments passed to single_func.
            **kwargs: Additional keyword arguments passed to single_func.

        Returns:
            Flat list of all results from each invocation.
        """
        futures = []
        with ThreadPoolExecutor(max_workers=THREAD_COUNT) as executor:
            for i in iterable:
                futures.append(executor.submit(single_func, i, *args, **kwargs))
            as_completed(futures)
        results = [val for future in futures for val in future.result()]
        return results

    return parallel_func


def date_range(start: str, end: str):
    """Generate a daily date range between two dates.

    Args:
        start: Start date string (YYYY-MM-DD).
        end: End date string (YYYY-MM-DD).

    Returns:
        ``pandas.DatetimeIndex`` with one entry per day.
    """
    return pd.date_range(start, end)


def s3_date_range(start: date, end: date, stops: list[str]):
    """Generate an optimized date range for S3 event file queries.

    For dates covered by monthly archives, returns the 1st of each month
    (fewer files to download). For dates after the monthly archive cutoff,
    returns every individual date. Commuter rail stops always use daily
    files since they have no monthly archives.

    Args:
        start: Start date of the range.
        end: End date of the range.
        stops: Stop IDs to query — used to detect commuter rail stops.

    Returns:
        ``pandas.DatetimeIndex`` with the optimized set of dates to query.
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

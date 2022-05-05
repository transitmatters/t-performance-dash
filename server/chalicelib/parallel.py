from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd


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


def date_range(start, end):
    return pd.date_range(start, end)


def month_range(start, end):
    # This is kinda funky, but is stil simpler than other approaches
    # pandas won't generate a monthly date_range that includes Jan and Feb for Jan31-Feb1 e.g.
    # So we generate a daily date_range and then resample it down (summing 0s as a no-op in the process) so it aligns.
    dates = pd.date_range(start, end, freq='1D', inclusive='both')
    series = pd.Series(0, index=dates)
    months = series.resample('1M').sum().index
    return months

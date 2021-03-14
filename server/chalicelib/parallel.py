from concurrent.futures import ThreadPoolExecutor, as_completed

import datetime


def make_parallel(single_func, THREAD_COUNT=5):
    # This function will wrap another function
    # (similar to a decorator, but we don't want to overwrite the original)
    # e.g. parallel_func = make_parallel(singleton_func)
    # singleton_func's first parameter must be the var to multiplex on
    # and parallel_func will take an iterable in its stead
    # TODO: handle kwargs?
    def parallel_func(iterable, *args):
        jobs = []
        for i in iterable:
            jobs.append((i, *args))

        futures = []
        with ThreadPoolExecutor(max_workers=THREAD_COUNT) as executor:
            for job in jobs:
                futures.append(executor.submit(single_func, *job))
            as_completed(futures)
        results = [val for future in futures for val in future.result()]
        return results

    return parallel_func


def date_range(start, end):
    cur = start
    while cur <= end:
        yield cur
        cur += datetime.timedelta(days=1)

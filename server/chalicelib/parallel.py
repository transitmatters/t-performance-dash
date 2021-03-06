from concurrent.futures import ThreadPoolExecutor, as_completed

import datetime

THREAD_COUNT = 5


def make_parallel(single_func):
    # TODO: consider signature... iterator, singleton func should take iter var as 1st arg?
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

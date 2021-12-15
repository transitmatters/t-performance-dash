from datetime import datetime
from chalicelib import s3, parallel

import itertools

DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_OUT = "%Y-%m-%dT%H:%M:%S"

EVENT_ARRIVAL = ["ARR", "PRA"]
EVENT_DEPARTURE = ["DEP", "PRD"]


def pairwise(iterable):
    # an itertools recipe from the docs
    # "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)


def unique_everseen(iterable, key=None):
    # an itertools recipe from the docs
    # "List unique elements, preserving order. Remember all elements ever seen."
    # unique_everseen('AAAABBBCCDAABBB') --> A B C D
    # unique_everseen('ABBCcAD', str.lower) --> A B C D
    seen = set()
    seen_add = seen.add
    if key is None:
        for element in itertools.filterfalse(seen.__contains__, iterable):
            seen_add(element)
            yield element
    else:
        for element in iterable:
            k = key(element)
            if k not in seen:
                seen_add(k)
                yield element


def dwells(stop_ids, sdate, edate):
    rows_by_time = s3.download_event_range(parallel.date_range(sdate, edate), stop_ids)

    dwells = []
    for maybe_an_arrival, maybe_a_departure in pairwise(rows_by_time):
        # Look for all ARR/DEP pairs for same trip id
        if maybe_an_arrival["event_type"] in EVENT_ARRIVAL and \
           maybe_a_departure["event_type"] in EVENT_DEPARTURE and \
           maybe_an_arrival["trip_id"] == maybe_a_departure["trip_id"]:

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


def headways(stop_ids, sdate, edate):
    rows_by_time = s3.download_event_range(parallel.date_range(sdate, edate), stop_ids)

    only_departures = filter(lambda row: row['event_type'] in EVENT_DEPARTURE, rows_by_time)

    headways = []
    for prev, this in pairwise(only_departures):
        if this["trip_id"] == prev["trip_id"] != '':
            # in rare cases, same train can arrive and depart twice
            # Here, we should skip the headway
            # (though if trip_id is empty, we don't know).
            continue
        this_dt = datetime.strptime(this["event_time"], DATE_FORMAT_MASSDOT)
        prev_dt = datetime.strptime(prev["event_time"], DATE_FORMAT_MASSDOT)
        delta = this_dt - prev_dt
        headway_time_sec = delta.total_seconds()

        headways.append({
            "route_id": this["route_id"],
            "direction": this["direction_id"],
            "current_dep_dt": this["event_time"],
            "headway_time_sec": headway_time_sec,
            "benchmark_headway_time_sec": None
        })

    return headways


def travel_times(stops_a, stops_b, sdate, edate):
    rows_by_time_a = s3.download_event_range(parallel.date_range(sdate, edate), stops_a)
    rows_by_time_b = s3.download_event_range(parallel.date_range(sdate, edate), stops_b)

    departures = filter(lambda event: event["event_type"] in EVENT_DEPARTURE, rows_by_time_a)
    # we reverse arrivals so that if the same train arrives twice (this can happen),
    # we get the earlier time.
    arrivals = {(event["service_date"], event["trip_id"]): event
                for event in reversed(rows_by_time_b)
                if event["event_type"] in EVENT_ARRIVAL and event["trip_id"] != ''}

    travel_times = []
    for departure in unique_everseen(departures, key=lambda x: (x['service_date'], x['trip_id'])):
        arrival = arrivals.get((departure["service_date"], departure["trip_id"]))
        if arrival is None:
            continue
        dep = departure["event_time"]
        arr = arrival["event_time"]

        dep_dt = datetime.strptime(dep, DATE_FORMAT_MASSDOT)
        arr_dt = datetime.strptime(arr, DATE_FORMAT_MASSDOT)
        delta = arr_dt - dep_dt
        travel_time_sec = delta.total_seconds()

        if travel_time_sec < 0:
            continue

        travel_times.append({
            "route_id": departure["route_id"],
            "direction": int(departure["direction_id"]),
            "dep_dt": dep_dt.strftime(DATE_FORMAT_OUT),
            "arr_dt": arr_dt.strftime(DATE_FORMAT_OUT),
            "travel_time_sec": travel_time_sec,
            "benchmark_travel_time_sec": None
        })

    return travel_times

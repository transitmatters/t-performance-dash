from datetime import datetime
from chalicelib import s3

import itertools

DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_OUT = "%Y/%m/%d %H:%M:%S"

EVENT_ARRIVAL = ["ARR", "PRA"]
EVENT_DEPARTURE = ["DEP", "PRD"]


def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)


def dwells(stop_id, sdate, edate):
    rows_by_time = s3.download_event_range(stop_id[0], sdate, edate)

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


def headways(stop_id, sdate, edate):
    rows_by_time = s3.download_event_range(stop_id[0], sdate, edate)

    only_departures = filter(lambda row: row['event_type'] in EVENT_DEPARTURE, rows_by_time)

    headways = []
    for prev, this in pairwise(only_departures):

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


def travel_times(stop_a, stop_b, sdate, edate):
    rows_by_time_a = s3.download_event_range(stop_a, sdate, edate)
    rows_by_time_b = s3.download_event_range(stop_b, sdate, edate)

    departures = filter(lambda event: event["event_type"] in EVENT_DEPARTURE, rows_by_time_a)
    arrivals = {(event["service_date"], event["trip_id"]): event for event in rows_by_time_b if event["event_type"] in EVENT_ARRIVAL}

    travel_times = []
    for departure in departures:
        arrival = arrivals.get((departure["service_date"], departure["trip_id"]))
        if arrival is None:
            continue
        dep = departure["event_time"]
        arr = arrival["event_time"]

        dep_dt = datetime.strptime(dep, DATE_FORMAT_MASSDOT)
        arr_dt = datetime.strptime(arr, DATE_FORMAT_MASSDOT)
        delta = arr_dt - dep_dt
        travel_time_sec = delta.total_seconds()

        travel_times.append({
            "route_id": departure["route_id"],
            "direction": int(departure["direction_id"]),
            "dep_dt": dep_dt.strftime(DATE_FORMAT_OUT),
            "arr_dt": arr_dt.strftime(DATE_FORMAT_OUT),
            "travel_time_sec": travel_time_sec,
            "benchmark_travel_time_sec": None
        })

    return travel_times

from datetime import datetime
from chalicelib import s3


DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_OUT = "%Y/%m/%d %H:%M:%S"

EVENT_ARRIVAL = ["ARR", "PRA"]
EVENT_DEPARTURE = ["DEP", "PRD"]


def dwells(stop_id, sdate, edate):
    rows_by_time = s3.download_event_range(stop_id[0], sdate, edate)

    dwells = []
    for i in range(0, len(rows_by_time) - 1):
        maybe_an_arrival = rows_by_time[i]
        maybe_a_departure = rows_by_time[i + 1]
        # Look for all ARR/DEP pairs for same trip id
        if maybe_an_arrival["event_type"] in EVENT_ARRIVAL and maybe_a_departure["event_type"] in EVENT_DEPARTURE and maybe_an_arrival["trip_id"] == maybe_a_departure["trip_id"]:
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

    only_departures = list(
        filter(lambda row: row['event_type'] in EVENT_DEPARTURE, rows_by_time))
    for i in range(1, len(only_departures)):
        this = only_departures[i]
        prev = only_departures[i - 1]

        this_dt = datetime.strptime(this["event_time"], DATE_FORMAT_MASSDOT)
        prev_dt = datetime.strptime(prev["event_time"], DATE_FORMAT_MASSDOT)
        delta = this_dt - prev_dt

        only_departures[i]["headway_time_sec"] = delta.total_seconds()

    # The first departure of the day has no headway..
    if len(only_departures) >= 1:
        only_departures[0]["headway_time_sec"] = 0

    # Mapping here so we only send back what the MBTA Performance API usually does
    return list(map(lambda departure: {
        "route_id": departure["route_id"],
        "direction": int(departure["direction_id"]),
        "current_dep_dt": departure["event_time"],
        "headway_time_sec": departure["headway_time_sec"],
        "benchmark_headway_time_sec": None
    }, only_departures))

# For a given trip ID and a list of events, find when that trip ARR'ed


def find_trip_id_arrival(trip_id, event_list):
    arrival = list(filter(
        lambda event: event["trip_id"] == trip_id and event["event_type"] in EVENT_ARRIVAL, event_list))
    if len(arrival) == 1:
        return arrival[0]["event_time"]
    else:
        return None


def travel_times(stop_a, stop_b, sdate, edate):
    rows_by_time_a = s3.download_event_range(stop_a, sdate, edate)
    rows_by_time_b = s3.download_event_range(stop_b, sdate, edate)

    only_departures = list(
        filter(lambda event: event["event_type"] in EVENT_DEPARTURE, rows_by_time_a))
    travel_times = []
    for departure in only_departures:
        dep = departure["event_time"]
        arr = find_trip_id_arrival(departure["trip_id"], rows_by_time_b)
        if arr is None:
            continue

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

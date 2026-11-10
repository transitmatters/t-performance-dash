"""CSV event parsing into performance metrics (headways, dwells, travel times).

Processes raw arrival/departure event files downloaded from S3 into
structured metric records used by the aggregation layer.
"""

from datetime import date
from chalicelib import s3
from chalicelib.constants import EVENT_ARRIVAL, EVENT_DEPARTURE

import itertools
import math
from chalicelib import date_utils, tm_benchmarks


def pairwise(iterable):
    """Yield consecutive overlapping pairs from an iterable.

    An itertools recipe: ``s -> (s0, s1), (s1, s2), (s2, s3), ...``

    Args:
        iterable: Any iterable to pair up.

    Returns:
        Iterator of 2-tuples of consecutive elements.
    """
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)


def unique_everseen(iterable, key=None):
    """Yield unique elements preserving first-seen order.

    An itertools recipe: ``unique_everseen('AAAABBBCCDAABBB') --> A B C D``

    Args:
        iterable: Any iterable to deduplicate.
        key: Optional function to compute the uniqueness key for each element.

    Yields:
        Elements from the iterable, skipping duplicates.
    """
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


def occupancy(row: dict):
    """Per-car occupancy from a LAMP event row, or None for each field when no car reported.

    A DEP row carries the reading taken on arrival at the next stop, so it describes how full the
    train left this stop.
    """
    return {
        "occupancy_status": row.get("occupancy_status") or None,
        "occupancy_percentage": row.get("occupancy_percentage") or None,
    }


# A train recorded arriving again this soon after it departed is still making the same stop, e.g. a
# Park St train moving up a berth, or the doubled events at Tufts in 2019. Real second visits come much
# later: some trip_ids pass through the same station again hours later on the same day.
SAME_STOP_REARRIVAL_SEC = 60


class _Stop:
    """One train's stop at the station, built up from its events."""

    __slots__ = ("arrival", "departure", "at_station")

    def __init__(self, arrival):
        self.arrival = arrival
        self.departure = None
        self.at_station = True


def dwells(stop_ids: list, start_date: date, end_date: date, single_day=False):
    """Calculate dwell times from raw arrival/departure events.

    A dwell runs from a trip's arrival to its next departure, matched on service date and
    trip_id, so other trains' events in between don't break it up. That matters wherever
    trains overlap at a station, like the Green Line trunk. Repeat arrivals before the
    departure are ignored, a re-arrival within SAME_STOP_REARRIVAL_SEC of departing extends
    the same stop, and events without a trip_id are skipped because they can't be matched.

    Args:
        stop_ids: Stop IDs to fetch event data for.
        start_date: Start of date range (inclusive).
        end_date: End of date range (inclusive).
        single_day: Whether this is a single-day request, which reads LAMP first.

    Returns:
        List of dwell time records, each containing route_id, direction,
        arr_dt, dep_dt, dwell_time_sec, vehicle_consist, occupancy_status, occupancy_percentage, and vehicle_label.
    """
    rows_by_time = s3.download_events(start_date, end_date, stop_ids, single_day)

    stops = []  # in order of arrival
    latest_stop = {}  # (service_date, trip_id) -> that trip's most recent stop
    for event in rows_by_time:
        if event["trip_id"] == "":
            continue
        key = (event["service_date"], event["trip_id"])
        stop = latest_stop.get(key)
        if event["event_type"] in EVENT_ARRIVAL:
            if stop is not None and (stop.at_station or _rearrived_quickly(stop.departure, event)):
                stop.at_station = True
            else:
                stop = latest_stop[key] = _Stop(event)
                stops.append(stop)
        elif event["event_type"] in EVENT_DEPARTURE and stop is not None and stop.at_station:
            stop.departure = event
            stop.at_station = False

    dwells = []
    for stop in stops:
        departure = stop.departure
        if departure is None:
            continue
        arr_dt = date_utils.parse_event_date(stop.arrival["event_time"])
        dep_dt = date_utils.parse_event_date(departure["event_time"])

        # not every vehicle will have vehicle_consist or occupancy
        vehicle_consist = departure.get("vehicle_consist")
        dwells.append(
            {
                "route_id": departure["route_id"],
                "direction": int(departure["direction_id"]),
                "arr_dt": date_utils.return_formatted_date(arr_dt),
                "dep_dt": date_utils.return_formatted_date(dep_dt),
                "dwell_time_sec": (dep_dt - arr_dt).total_seconds(),
                "vehicle_consist": vehicle_consist,
                **occupancy(departure),
                "vehicle_label": departure["vehicle_label"],
            }
        )

    return dwells


def _rearrived_quickly(departure, arrival):
    """Whether an arrival comes soon enough after the same trip's departure to be the same stop."""
    gap = date_utils.parse_event_date(arrival["event_time"]) - date_utils.parse_event_date(departure["event_time"])
    return gap.total_seconds() <= SAME_STOP_REARRIVAL_SEC


def headways(stop_ids: list, start_date: date, end_date: date, single_day=False):
    """Calculate headways from consecutive departure events.

    Computes the time between consecutive departures at a stop. Skips
    duplicate departures from the same trip and filters out headways
    exceeding 120 minutes (except for commuter rail).

    Args:
        stop_ids: Stop IDs to fetch event data for.
        start_date: Start of date range (inclusive).
        end_date: End of date range (inclusive).
        single_day: Whether this is a single-day request, which reads LAMP first.

    Returns:
        List of headway records, each containing route_id, direction,
        current_dep_dt, headway_time_sec, benchmark_headway_time_sec,
        vehicle_consist, occupancy_status, occupancy_percentage, and vehicle_label.
    """
    rows_by_time = s3.download_events(start_date, end_date, stop_ids, single_day)

    only_departures = filter(lambda row: row["event_type"] in EVENT_DEPARTURE, rows_by_time)

    headways = []
    for prev, this in pairwise(only_departures):
        if this["trip_id"] == prev["trip_id"] != "":
            # in rare cases, same train can arrive and depart twice
            # Here, we should skip the headway
            # (though if trip_id is empty, we don't know).
            continue
        this_dt = date_utils.parse_event_date(this["event_time"])
        prev_dt = date_utils.parse_event_date(prev["event_time"])
        delta = this_dt - prev_dt
        headway_time_sec = delta.total_seconds()

        # Throw out any headways > 120 min
        if headway_time_sec > 120 * 60 and not s3.is_cr(this["route_id"]):
            continue

        benchmark_headway = this.get("scheduled_headway")
        if benchmark_headway:
            try:
                benchmark_headway = float(benchmark_headway)
                # Check for NaN or Infinity
                if math.isnan(benchmark_headway) or math.isinf(benchmark_headway):
                    benchmark_headway = None
            except ValueError, TypeError:
                benchmark_headway = None
        else:
            benchmark_headway = None

        # not every vehicle will have vehicle_consist or occupancy
        vehicle_consist = this.get("vehicle_consist")

        headways.append(
            {
                "route_id": this["route_id"],
                "direction": this["direction_id"],
                "current_dep_dt": date_utils.return_formatted_date(this_dt),
                "headway_time_sec": headway_time_sec,
                "benchmark_headway_time_sec": benchmark_headway,
                "vehicle_consist": vehicle_consist,
                **occupancy(this),
                "vehicle_label": this["vehicle_label"],
            }
        )

    return headways


def travel_times(stops_a: list, stops_b: list, start_date: date, end_date: date, single_day=False):
    """Calculate travel times between two sets of stops.

    Matches departure events at origin stops to arrival events at destination
    stops for the same trip_id, computing the elapsed time. Negative travel
    times are discarded. Includes benchmark (scheduled) travel times when available.

    Args:
        stops_a: Origin stop IDs.
        stops_b: Destination stop IDs.
        start_date: Start of date range (inclusive).
        end_date: End of date range (inclusive).
        single_day: Whether this is a single-day request, which reads LAMP first.

    Returns:
        List of travel time records, each containing route_id, direction,
        dep_dt, arr_dt, travel_time_sec, benchmark_travel_time_sec,
        vehicle_consist, occupancy_status, occupancy_percentage, and vehicle_label.
    """
    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor(max_workers=2) as executor:
        fut_a = executor.submit(s3.download_events, start_date, end_date, stops_a, single_day)
        fut_b = executor.submit(s3.download_events, start_date, end_date, stops_b, single_day)
        rows_by_time_a = fut_a.result()
        rows_by_time_b = fut_b.result()

    # Resolve the TM benchmark ONCE for this request using the station-level
    # stop lists. Multi-platform stations (Park St westbound has 70196-70199)
    # mean a single chart can contain trips recorded at different platforms;
    # looking up per-trip would leave non-canonical-platform trips without a
    # TM value and produce a jagged benchmark band that zig-zags between the
    # TM floor and the per-trip MBTA fallback.
    tm_benchmark = tm_benchmarks.resolve_travel_time_benchmark(stops_a, stops_b)

    departures = filter(lambda event: event["event_type"] in EVENT_DEPARTURE, rows_by_time_a)
    # we reverse arrivals so that if the same train arrives twice (this can happen),
    # we get the earlier time.
    arrivals = {
        (event["service_date"], event["trip_id"]): event
        for event in reversed(list(rows_by_time_b))
        if event["event_type"] in EVENT_ARRIVAL and event["trip_id"] != ""
    }

    travel_times = []
    for departure in unique_everseen(departures, key=lambda x: (x["service_date"], x["trip_id"])):
        arrival = arrivals.get((departure["service_date"], departure["trip_id"]))
        if arrival is None:
            continue
        dep = departure["event_time"]
        arr = arrival["event_time"]

        dep_dt = date_utils.parse_event_date(dep)
        arr_dt = date_utils.parse_event_date(arr)
        delta = arr_dt - dep_dt
        travel_time_sec = delta.total_seconds()

        if travel_time_sec < 0:
            continue

        # benchmark calculation:
        # not every file will have the scheduled_tt field, so we use get.
        sched_arr = arrival.get("scheduled_tt") or arrival.get("scheduled_travel_time")
        sched_dep = departure.get("scheduled_tt") or departure.get("scheduled_travel_time")
        try:
            # sched values may be None or ''
            benchmark = float(sched_arr) - float(sched_dep)
            # Check for NaN, Infinity, or invalid values
            if math.isnan(benchmark) or math.isinf(benchmark) or benchmark < 1:
                benchmark = None
        except TypeError, ValueError:
            benchmark = None

        # not every vehicle will have vehicle_consist or occupancy
        vehicle_consist = departure.get("vehicle_consist")
        travel_times.append(
            {
                "route_id": departure["route_id"],
                "direction": int(departure["direction_id"]),
                "dep_dt": date_utils.return_formatted_date(dep_dt),
                "arr_dt": date_utils.return_formatted_date(arr_dt),
                "travel_time_sec": travel_time_sec,
                "benchmark_travel_time_sec": benchmark,
                "tm_benchmark_travel_time_sec": tm_benchmark,
                "vehicle_consist": vehicle_consist,
                **occupancy(departure),
                "vehicle_label": departure["vehicle_label"],
            }
        )

    return travel_times

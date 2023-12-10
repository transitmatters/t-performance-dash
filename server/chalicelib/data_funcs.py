import datetime
import pytz
import traceback
from datetime import date, timedelta
from typing import Dict, Any, Callable, List, Union
from chalicelib import MbtaPerformanceAPI, s3_historical, s3_alerts, s3

DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"
WE_HAVE_ALERTS_SINCE = datetime.date(2017, 11, 6)


def bucket_by(
    items: List[any],
    key_getter: Union[str, Callable[[Any], str]],
) -> Dict[str, List[any]]:
    res = {}
    if isinstance(key_getter, str):
        key_getter_as_str = key_getter
        key_getter = lambda dict: dict[key_getter_as_str]
    for item in items:
        key = key_getter(item)
        res.setdefault(key, [])
        res[key].append(item)
    return res


def index_by(items: List[any], key_getter: Union[str, Callable[[Any], str]]):
    res = {}
    if isinstance(key_getter, str):
        key_getter_as_str = key_getter
        key_getter = lambda dict: dict[key_getter_as_str]
    for item in items:
        key = key_getter(item)
        res[key] = item
    return res


def date_range(start_date: date, end_date: date):
    now = start_date
    while now <= end_date:
        yield now
        now = now + timedelta(days=1)


def stamp_to_dt(stamp):
    stamp = int(stamp)
    dt = datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))
    return dt.strftime(DATE_FORMAT)


def is_bus(stops):
    return all(map(s3.is_bus, stops))


def use_S3(date, bus=False):
    archival = (date.today() - date).days >= 90
    return archival or bus


def partition_S3_dates(start_date, end_date, bus=False):
    """
    Partitions dates by what data source they should be fetched from.
    S3 is used for archival data and for bus data. API is used for recent (within 90 days) subway data.
    TODO: Add Gobble data to this partitioning.
    """
    CUTOFF = datetime.date.today() - datetime.timedelta(days=90)

    s3_dates = None
    api_dates = None

    if end_date < CUTOFF or bus:
        s3_dates = (start_date, end_date)
    elif CUTOFF <= start_date:
        api_dates = (start_date, end_date)
    else:
        s3_dates = (start_date, CUTOFF - datetime.timedelta(days=1))
        api_dates = (CUTOFF, end_date)

    return (s3_dates, api_dates)


def headways(sdate, stops, edate=None):
    if edate is None:
        if use_S3(sdate, is_bus(stops)):
            return s3_historical.headways(stops, sdate, sdate)
        else:
            return process_mbta_headways(stops, sdate)

    s3_interval, api_interval = partition_S3_dates(sdate, edate, is_bus(stops))
    all_data = []
    if s3_interval:
        start, end = s3_interval
        all_data.extend(s3_historical.headways(stops, start, end))

    if api_interval:
        start, end = api_interval
        all_data.extend(process_mbta_headways(stops, start, end))

    return all_data


# Transit days run 3:30am-3:30am local time
def current_transit_day():
    bos_tz = pytz.timezone("America/New_York")
    now = bos_tz.localize(datetime.datetime.now())
    today = now.date()
    if now >= now.replace(hour=0, minute=0) and now < now.replace(hour=3, minute=30):
        today -= datetime.timedelta(days=1)
    return today


def process_mbta_headways(stops, sdate, edate=None):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data("headways", {"stop": stops}, sdate, edate)
    # combine all headways data
    headways = []
    for dict_data in api_data:
        headways += dict_data.get("headways", [])

    # conversion
    for headway_dict in headways:
        # convert to datetime
        headway_dict["current_dep_dt"] = stamp_to_dt(headway_dict.get("current_dep_dt"))
        headway_dict["previous_dep_dt"] = stamp_to_dt(headway_dict.get("previous_dep_dt"))
        # convert to int
        headway_dict["benchmark_headway_time_sec"] = int(headway_dict.get("benchmark_headway_time_sec"))
        headway_dict["headway_time_sec"] = int(headway_dict.get("headway_time_sec"))
        headway_dict["direction"] = int(headway_dict.get("direction"))

    return sorted(headways, key=lambda x: x["current_dep_dt"])


def travel_times(sdate, from_stops, to_stops, edate=None):
    if edate is None:
        if use_S3(sdate, is_bus(from_stops)):
            return s3_historical.travel_times(from_stops, to_stops, sdate, sdate)
        else:
            return process_mbta_travel_times(from_stops, to_stops, sdate)

    s3_interval, api_interval = partition_S3_dates(sdate, edate, is_bus(from_stops))
    all_data = []
    if s3_interval:
        start, end = s3_interval
        all_data.extend(s3_historical.travel_times(from_stops, to_stops, start, end))

    if api_interval:
        start, end = api_interval
        all_data.extend(process_mbta_travel_times(from_stops, to_stops, start, end))
    return all_data


def process_mbta_travel_times(from_stops, to_stops, sdate, edate=None):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(
        "traveltimes", {"from_stop": from_stops, "to_stop": to_stops}, sdate, edate
    )
    # combine all travel times data, remove threshold flags from performance API, and dedupe on `dep_dt`
    trips = {}
    for dict_data in api_data:
        for event in dict_data.get("travel_times", []):
            dep_dt = event["dep_dt"]
            if dep_dt not in trips:
                trips[dep_dt] = {
                    "route_id": event["route_id"],
                    "direction": int(event["direction"]),
                    # convert to datetime
                    "dep_dt": stamp_to_dt(event["dep_dt"]),
                    "arr_dt": stamp_to_dt(event["arr_dt"]),
                    # convert to int
                    "travel_time_sec": int(event["travel_time_sec"]),
                    "benchmark_travel_time_sec": int(event["benchmark_travel_time_sec"]),
                }
    trips_list = list(trips.values())
    return sorted(trips_list, key=lambda x: x["dep_dt"])


def dwells(sdate, stops, edate=None):
    if edate is None:
        if use_S3(sdate, is_bus(stops)):
            return s3_historical.dwells(stops, sdate, sdate)
        else:
            return process_mbta_dwells(stops, sdate)

    s3_interval, api_interval = partition_S3_dates(sdate, edate, is_bus(stops))
    all_data = []
    if s3_interval:
        start, end = s3_interval
        all_data.extend(s3_historical.dwells(stops, start, end))

    if api_interval:
        start, end = api_interval
        all_data.extend(process_mbta_dwells(stops, start, end))

    return all_data


def process_mbta_dwells(stops, sdate, edate=None):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data("dwells", {"stop": stops}, sdate, edate)

    # combine all travel times data
    dwells = []
    for dict_data in api_data:
        dwells += dict_data.get("dwell_times", [])

    # conversion
    for dwell_dict in dwells:
        # convert to datetime
        dwell_dict["arr_dt"] = stamp_to_dt(dwell_dict.get("arr_dt"))
        dwell_dict["dep_dt"] = stamp_to_dt(dwell_dict.get("dep_dt"))
        # convert to int
        dwell_dict["dwell_time_sec"] = int(dwell_dict.get("dwell_time_sec"))
        dwell_dict["direction"] = int(dwell_dict.get("direction"))

    return sorted(dwells, key=lambda x: x["arr_dt"])


def alerts(day, params):
    try:
        # Grab the current "transit day" (3:30am-3:30am)
        today = current_transit_day()
        # yesterday + 1 bonus day to cover the gap, since aws is only populated at 5/6am.
        yesterday = today - datetime.timedelta(days=2)

        # Use the API for today and yesterday's transit day, otherwise us.
        if day >= yesterday:
            api_data = MbtaPerformanceAPI.get_api_data("pastalerts", params, day)
        elif day >= WE_HAVE_ALERTS_SINCE:
            # This is stupid because we're emulating MBTA-performance ick
            api_data = [{"past_alerts": s3_alerts.get_alerts(day, params["route"])}]
        else:
            return None

        # combine all alerts data
        alert_items = []
        for dict_data in api_data:
            alert_items = alert_items + dict_data.get("past_alerts", [])

        # get data
        flat_alerts = []
        for alert_item in alert_items:
            for alert_version in alert_item["alert_versions"]:
                flat_alerts.append(
                    {
                        "valid_from": stamp_to_dt(int(alert_version["valid_from"])),
                        "valid_to": stamp_to_dt(int(alert_version["valid_to"])),
                        "text": alert_version["header_text"],
                    }
                )
        return flat_alerts
    except Exception:
        traceback.print_exc()
        return None

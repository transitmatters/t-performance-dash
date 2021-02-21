import datetime
import pytz
from chalicelib import MbtaPerformanceAPI, s3_historical

DATE_FORMAT = "%Y/%m/%d %H:%M:%S"


def stamp_to_dt(stamp):
    stamp = int(stamp)
    dt = datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))
    return dt.strftime(DATE_FORMAT)

def use_S3(date):
    return (date.today() - date).days >= 90

def partition_S3_dates(start_date, end_date):
    CUTOFF = datetime.date.today() - datetime.timedelta(days=90)

    s3_dates = None
    api_dates = None

    if end_date < CUTOFF:
        s3_dates = (start_date, end_date)
    elif CUTOFF <= start_date:
        api_dates = (start_date, end_date)
    else:
        s3_dates = (start_date, CUTOFF - datetime.timedelta(days=1))
        api_dates = (CUTOFF, end_date)

    return (s3_dates, api_dates)
        
def headways(sdate, stops, edate=None):
    if edate is None:
        if use_S3(sdate):
            return s3_historical.headways(stops, sdate)
        else:
            return process_mbta_headways(sdate, stops)

    s3_interval, api_interval = partition_S3_dates(sdate, edate)
    all_data = []
    if s3_interval:
        start, end = s3_interval
        delta = (end - start).days + 1
        for i in range(delta):
            all_data.extend(s3_historical.headways(stops, start + datetime.timedelta(days=i)))

    if api_interval:
        start, end = api_interval
        delta = (end - start).days + 1 # to make it pythonic: we want to include the end date
        # MBTA api won't accept queries > 7 days.
        # We could move this logic inside the api (since it generates multiple requests), or leave it here.
        cur = start
        while delta != 0:
            inc = min(delta, 7)
            all_data.extend(process_mbta_headways(cur, stops, cur + datetime.timedelta(days=inc - 1)))
            delta -= inc
            cur += datetime.timedelta(days=inc)

    return all_data
        

def process_mbta_headways(sdate, stops, edate=None):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(sdate, "headways", {
        "stop": stops
    }, end_day=edate)

    # combine all headways data
    headways = []
    for dict_data in api_data:
        headways = headways + dict_data.get('headways', [])

    # conversion
    for headway_dict in headways:
        # convert to datetime
        headway_dict["current_dep_dt"] = stamp_to_dt(
            headway_dict.get("current_dep_dt"))
        headway_dict["previous_dep_dt"] = stamp_to_dt(
            headway_dict.get("previous_dep_dt"))
        # convert to int
        headway_dict["benchmark_headway_time_sec"] = int(
            headway_dict.get("benchmark_headway_time_sec")
        )
        headway_dict["headway_time_sec"] = int(headway_dict.get("headway_time_sec"))
        headway_dict["direction"] = int(headway_dict.get("direction"))

    return headways

def travel_times(sdate, from_stops, to_stops, edate=None):
    if edate is None:
        if use_S3(sdate):
            return s3_historical.travel_times(from_stops, to_stops, sdate)
        else:
            return process_mbta_travel_times(sdate, from_stops, to_stops)

    s3_interval, api_interval = partition_S3_dates(sdate, edate)
    all_data = []
    if s3_interval:
        start, end = s3_interval
        delta = (end - start).days + 1
        for i in range(delta):
            all_data.extend(s3_historical.travel_times(from_stops, to_stops, start + datetime.timedelta(days=i)))

    if api_interval:
        start, end = api_interval
        delta = (end - start).days + 1 # to make it pythonic: we want to include the end date
        # MBTA api won't accept queries > 7 days.
        # We could move this logic inside the api (since it generates multiple requests), or leave it here.
        cur = start
        while delta != 0:
            inc = min(delta, 7)
            all_data.extend(process_mbta_travel_times(cur, from_stops, to_stops,
                                                      cur + datetime.timedelta(days=inc - 1)))
            delta -= inc
            cur += datetime.timedelta(days=inc)

    return all_data

def process_mbta_travel_times(sdate, from_stops, to_stops, edate=None):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(sdate, "traveltimes", {
        "from_stop": from_stops,
        "to_stop": to_stops
    },
    edate)

    # combine all travel times data
    travel = []
    for dict_data in api_data:
        travel = travel + dict_data.get('travel_times', [])

    # conversion
    for travel_dict in travel:
        # convert to datetime
        travel_dict["arr_dt"] = stamp_to_dt(
            travel_dict.get("arr_dt"))
        travel_dict["dep_dt"] = stamp_to_dt(
            travel_dict.get("dep_dt"))
        # convert to int
        travel_dict["benchmark_travel_time_sec"] = int(
            travel_dict.get("benchmark_travel_time_sec")
        )
        travel_dict["travel_time_sec"] = int(travel_dict.get("travel_time_sec"))
        travel_dict["direction"] = int(travel_dict.get("direction"))

    return travel

def dwells(sdate, stops, edate=None):
    if edate is None:
        if use_S3(sdate):
            return s3_historical.dwells(stops, sdate)
        else:
            return process_mbta_dwells(sdate, stops)

    s3_interval, api_interval = partition_S3_dates(sdate, edate)
    all_data = []
    if s3_interval:
        start, end = s3_interval
        delta = (end - start).days + 1
        for i in range(delta):
            all_data.extend(s3_historical.dwells(stops, start + datetime.timedelta(days=i)))

    if api_interval:
        start, end = api_interval
        delta = (end - start).days + 1 # to make it pythonic: we want to include the end date
        # MBTA api won't accept queries > 7 days.
        # We could move this logic inside the api (since it generates multiple requests), or leave it here.
        cur = start
        while delta != 0:
            inc = min(delta, 7)
            all_data.extend(process_mbta_dwells(cur, stops, cur + datetime.timedelta(days=inc - 1)))
            delta -= inc
            cur += datetime.timedelta(days=inc)

    return all_data
    

def process_mbta_dwells(sdate, stops, edate=None):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(sdate, "dwells", {
        "stop": stops,
    }, edate)

    # combine all travel times data
    dwells = []
    for dict_data in api_data:
        dwells = dwells + dict_data.get('dwell_times', [])

    # conversion
    for dwell_dict in dwells:
        # convert to datetime
        dwell_dict["arr_dt"] = stamp_to_dt(
            dwell_dict.get("arr_dt"))
        dwell_dict["dep_dt"] = stamp_to_dt(
            dwell_dict.get("dep_dt"))
        # convert to int
        dwell_dict["dwell_time_sec"] = int(dwell_dict.get("dwell_time_sec"))
        dwell_dict["direction"] = int(dwell_dict.get("direction"))

    return dwells


def alerts(date, params):
    api_data = MbtaPerformanceAPI.get_api_data(date, "pastalerts", params)

    # combine all alerts data
    alert_items = []
    for dict_data in api_data:
        alert_items = alert_items + dict_data.get('past_alerts', [])

    # get data
    flat_alerts = []
    for alert_item in alert_items:
        for alert_version in alert_item["alert_versions"]:
            flat_alerts.append({
                "valid_from": stamp_to_dt(alert_version["valid_from"]),
                "valid_to": stamp_to_dt(alert_version["valid_to"]),
                "text": alert_version["header_text"]
            })
    return flat_alerts

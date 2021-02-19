import datetime
import pytz
from chalicelib import MbtaPerformanceAPI, s3_historical

DATE_FORMAT = "%Y/%m/%d %H:%M:%S"


def stamp_to_dt(stamp):
    return datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))


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

    return {
        's3_interval': s3_dates,
        'mbta_api_interval': api_dates
    }


def headways(date, stops):
    if use_S3(date):
        return s3_historical.headways(stops, date.year, date.month, date.day)
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(date, "headways", {
        "stop": stops
    })

    # combine all headways data
    headways = []
    for dict_data in api_data:
        headways = headways + dict_data.get('headways', [])

    # conversion
    for headway_dict in headways:
        # convert to datetime
        headway_dict["current_dep_dt"] = stamp_to_dt(
            int(headway_dict.get("current_dep_dt"))
        ).strftime(DATE_FORMAT)
        headway_dict["previous_dep_dt"] = stamp_to_dt(
            int(headway_dict.get("previous_dep_dt"))
        ).strftime(DATE_FORMAT)
        # convert to int
        headway_dict["benchmark_headway_time_sec"] = int(
            headway_dict.get("benchmark_headway_time_sec")
        )
        headway_dict["headway_time_sec"] = int(headway_dict.get("headway_time_sec"))
        headway_dict["direction"] = int(headway_dict.get("direction"))

    return headways


def travel_times(date, from_stops, to_stops):
    if use_S3(date):
        return s3_historical.travel_times(from_stops[0], to_stops[0], date.year, date.month, date.day)

    # get data
    api_data = MbtaPerformanceAPI.get_api_data(date, "traveltimes", {
        "from_stop": from_stops,
        "to_stop": to_stops
    })

    # combine all travel times data
    travel = []
    for dict_data in api_data:
        travel = travel + dict_data.get('travel_times', [])

    # conversion
    for travel_dict in travel:
        # convert to datetime
        travel_dict["arr_dt"] = stamp_to_dt(
            int(travel_dict.get("arr_dt"))
        ).strftime(DATE_FORMAT)
        travel_dict["dep_dt"] = stamp_to_dt(
            int(travel_dict.get("dep_dt"))
        ).strftime(DATE_FORMAT)
        # convert to int
        travel_dict["benchmark_travel_time_sec"] = int(
            travel_dict.get("benchmark_travel_time_sec")
        )
        travel_dict["travel_time_sec"] = int(travel_dict.get("travel_time_sec"))
        travel_dict["direction"] = int(travel_dict.get("direction"))

    return travel


def dwells(date, stops):
    if use_S3(date):
        return s3_historical.dwells(stops, date.year, date.month, date.day)

    # get data
    api_data = MbtaPerformanceAPI.get_api_data(date, "dwells", {
        "stop": stops,
    })

    # combine all travel times data
    dwells = []
    for dict_data in api_data:
        dwells = dwells + dict_data.get('dwell_times', [])

    # conversion
    for dwell_dict in dwells:
        # convert to datetime
        dwell_dict["arr_dt"] = stamp_to_dt(
            int(dwell_dict.get("arr_dt"))
        ).strftime(DATE_FORMAT)
        dwell_dict["dep_dt"] = stamp_to_dt(
            int(dwell_dict.get("dep_dt"))
        ).strftime(DATE_FORMAT)
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
                "valid_from": stamp_to_dt(int(alert_version["valid_from"])).strftime(DATE_FORMAT),
                "valid_to": stamp_to_dt(int(alert_version["valid_to"])).strftime(DATE_FORMAT),
                "text": alert_version["header_text"]
            })
    return flat_alerts

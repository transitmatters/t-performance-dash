import datetime
import pytz
from chalicelib import MbtaPerformanceAPI, s3_alerts

DATE_FORMAT = "%Y/%m/%d %H:%M:%S"
WE_STARTED_COLLECTING_ALERTS = datetime.date(2021, 2, 1)


def stamp_to_dt(stamp):
    return datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))


def headways(day, params):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(day, "headways", params)

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


def travel_times(day, params):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(day, "traveltimes", params)

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


def dwells(day, params):
    # get data
    api_data = MbtaPerformanceAPI.get_api_data(day, "dwells", params)

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


def alerts(day, params):
    try:
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        if day <= yesterday and day >= WE_STARTED_COLLECTING_ALERTS:
            # This is stupid because we're emulating MBTA-performance ick
            api_data = [{"past_alerts": s3_alerts.get_alerts(day, params["route"])}]
        else:
            api_data = MbtaPerformanceAPI.get_api_data(day, "pastalerts", params)

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
    except Exception:
        return []

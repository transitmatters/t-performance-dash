from MbtaPerformanceAPI import *

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def headways(day, params):
    # get data
    api_data = get_api_data(day, "headways", params)

    # just headways data
    headways = api_data.get("headways", {})

    # conversion
    for headway_dict in headways:
        # convert to datetime
        headway_dict["current_dep_dt"] = datetime.fromtimestamp(
            int(headway_dict.get("current_dep_dt"))
        ).strftime(DATE_FORMAT)
        headway_dict["previous_dep_dt"] = datetime.fromtimestamp(
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
    api_data = get_api_data(day, "traveltimes", params)

    # just dwells data
    travel = api_data.get("travel_times", {})

    # conversion
    for travel_dict in travel:
        # convert to datetime
        travel_dict["arr_dt"] = datetime.fromtimestamp(
            int(travel_dict.get("arr_dt"))
        ).strftime(DATE_FORMAT)
        travel_dict["dep_dt"] = datetime.fromtimestamp(
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
    api_data = get_api_data(day, "dwells", params)

    # just dwells data
    dwells = api_data.get("dwell_times", {})

    # conversion
    for dwell_dict in dwells:
        # convert to datetime
        dwell_dict["arr_dt"] = datetime.fromtimestamp(
            int(dwell_dict.get("arr_dt"))
        ).strftime(DATE_FORMAT)
        dwell_dict["dep_dt"] = datetime.fromtimestamp(
            int(dwell_dict.get("dep_dt"))
        ).strftime(DATE_FORMAT)
        # convert to int
        dwell_dict["dwell_time_sec"] = int(dwell_dict.get("dwell_time_sec"))
        dwell_dict["direction"] = int(dwell_dict.get("direction"))

    return dwells

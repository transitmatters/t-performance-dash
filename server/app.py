import json
from chalice import Chalice, CORSConfig
from datetime import date
from chalicelib import data_funcs, aggregation, s3_historical

app = Chalice(app_name="data-dashboard")

cors_config = CORSConfig(
    allow_origin="https://dashboard.transitmatters.org", max_age=3600
)


def parse_user_date(user_date):
    date_split = user_date.split("-")
    [year, month, day] = [int(x) for x in date_split[0:3]]
    return date(year=year, month=month, day=day)


def parse_query_stop_args(query_params, expected_stop_param_names):
    stops_dict = {}
    for stop_param in expected_stop_param_names:
        query_value = query_params.get(stop_param)
        if query_value:
            stops_dict[stop_param] = query_value
    return stops_dict


def mutlidict_to_dict(mutlidict):
    res_dict = {}
    for key in mutlidict.keys():
        res_dict[key] = mutlidict.getlist(key)
    return res_dict


@app.route("/headways/{user_date}", cors=cors_config)
def headways_route(user_date):
    date = parse_user_date(user_date)
    stop = app.current_request.query_params["stop"]
    return data_funcs.headways(date, [stop])


@app.route("/dwells/{user_date}", cors=cors_config)
def dwells_route(user_date):
    date = parse_user_date(user_date)
    stop = app.current_request.query_params["stop"]
    return data_funcs.dwells(date, [stop])


@app.route("/traveltimes/{user_date}", cors=cors_config)
def traveltime_route(user_date):
    date = parse_user_date(user_date)
    from_stop = app.current_request.query_params["from_stop"]
    to_stop = app.current_request.query_params["to_stop"]
    return data_funcs.travel_times(date, [from_stop], [to_stop])


@app.route("/alerts/{user_date}", cors=cors_config)
def alerts_route(user_date):
    date = parse_user_date(user_date)
    if data_funcs.use_S3(date):
        return []
    else:
        return data_funcs.alerts(date, mutlidict_to_dict(app.current_request.query_params))


@app.route("/aggregate/traveltimes", cors=cors_config)
def traveltime_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    from_stop = app.current_request.query_params["from_stop"]
    to_stop = app.current_request.query_params["to_stop"]

    response = aggregation.travel_times_over_time(sdate, edate, from_stop, to_stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)

@app.route("/aggregate/headways", cors=cors_config)
def traveltime_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    stop = app.current_request.query_params["stop"]

    response = aggregation.headways_over_time(sdate, edate, stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)

@app.route("/aggregate/dwells", cors=cors_config)
def traveltime_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    stop = app.current_request.query_params["stop"]

    response = aggregation.dwells_over_time(sdate, edate, stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)

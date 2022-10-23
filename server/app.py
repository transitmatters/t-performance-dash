import json
import os
import subprocess
from chalice import Chalice, CORSConfig, ConflictError, Response
from datetime import date
from chalicelib import (
    aggregation,
    data_funcs,
    secrets,
)

app = Chalice(app_name="data-dashboard")

# will run on localhost if TM_FRONTEND_HOST is not set in env
TM_FRONTEND_HOST = os.environ.get("TM_FRONTEND_HOST", "localhost")

cors_config = CORSConfig(
    allow_origin=f"https://{TM_FRONTEND_HOST}", max_age=3600
)


def parse_user_date(user_date):
    date_split = user_date.split("-")
    [year, month, day] = [int(x) for x in date_split[0:3]]
    return date(year=year, month=month, day=day)


def mutlidict_to_dict(mutlidict):
    res_dict = {}
    for key in mutlidict.keys():
        res_dict[key] = mutlidict.getlist(key)
    return res_dict


@app.route("/healthcheck", cors=cors_config)
def healthcheck():
    # These functions must return True or False :-)
    checks = {
        "API Key Present": (lambda: len(secrets.MBTA_V2_API_KEY) > 0),
        "S3 Alert Fetching": (lambda: "2020-11-07 10:33:40" in json.dumps(data_funcs.headways(date(year=2020, month=11, day=7), ["70061"])))
    }

    failed_checks = []
    for check in checks:
        try:
            if not checks[check]():
                failed_checks += check
        except Exception:
            failed_checks += [check]

    if len(failed_checks) == 0:
        return Response(body={
            "status": "pass"
        }, status_code=200)

    return Response(body={
        "status": "fail",
        "failed_checks_sum": len(failed_checks),
        "failed_checks": failed_checks
    }, status_code=500)


@app.route("/headways/{user_date}", cors=cors_config)
def headways_route(user_date):
    date = parse_user_date(user_date)
    stops = app.current_request.query_params.getlist("stop")
    return data_funcs.headways(date, stops)


@app.route("/dwells/{user_date}", cors=cors_config)
def dwells_route(user_date):
    date = parse_user_date(user_date)
    stops = app.current_request.query_params.getlist("stop")
    return data_funcs.dwells(date, stops)


@app.route("/traveltimes/{user_date}", cors=cors_config)
def traveltime_route(user_date):
    date = parse_user_date(user_date)
    from_stops = app.current_request.query_params.getlist("from_stop")
    to_stops = app.current_request.query_params.getlist("to_stop")
    return data_funcs.travel_times(date, from_stops, to_stops)


@app.route("/alerts/{user_date}", cors=cors_config)
def alerts_route(user_date):
    date = parse_user_date(user_date)
    return json.dumps(data_funcs.alerts(date, mutlidict_to_dict(app.current_request.query_params)))


@app.route("/aggregate/traveltimes", cors=cors_config)
def traveltime_aggregate_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    from_stops = app.current_request.query_params.getlist("from_stop")
    to_stops = app.current_request.query_params.getlist("to_stop")

    response = aggregation.travel_times_over_time(sdate, edate, from_stops, to_stops)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/aggregate/traveltimes2", cors=cors_config)
def traveltime_aggregate_route_2():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    from_stop = app.current_request.query_params.getlist("from_stop")
    to_stop = app.current_request.query_params.getlist("to_stop")

    response = aggregation.travel_times_all(sdate, edate, from_stop, to_stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/aggregate/headways", cors=cors_config)
def headways_aggregate_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    stops = app.current_request.query_params.getlist("stop")

    response = aggregation.headways_over_time(sdate, edate, stops)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/aggregate/dwells", cors=cors_config)
def dwells_aggregate_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    stops = app.current_request.query_params.getlist("stop")

    response = aggregation.dwells_over_time(sdate, edate, stops)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/git_id", cors=cors_config)
def get_git_id():
    # Only do this on localhost
    if TM_FRONTEND_HOST == "localhost":
        git_id = str(subprocess.check_output(['git', 'describe', '--always', '--dirty', '--abbrev=10']))[2:-3]
        return json.dumps({"git_id": git_id})
    else:
        raise ConflictError("Cannot get git id from serverless host")

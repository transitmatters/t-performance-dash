import json
import os
import subprocess
from chalice import Chalice, Cron, CORSConfig, ConflictError, Response
from datetime import date, timedelta
from chalicelib import data_funcs, aggregation, s3_alerts, secrets

app = Chalice(app_name="data-dashboard")

# will run on localhost if TM_FRONTEND_HOST is not set in env
TM_FRONTEND_HOST = os.environ.get("TM_FRONTEND_HOST", "localhost")

cors_config = CORSConfig(
    allow_origin=f"https://{TM_FRONTEND_HOST}", max_age=3600
)


# Every day at 10am UTC: store alerts from the past
# It's called yesterday for now but it's really two days ago!!
@app.schedule(Cron(0, 10, '*', '*', '?', '*'))
def store_two_days_ago_alerts(event):
    # Only do this on the main site
    if TM_FRONTEND_HOST == "dashboard.transitmatters.org":
        two_days_ago = date.today() - timedelta(days=2)
        s3_alerts.store_alerts(two_days_ago)


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


@app.route("/healthcheck", cors=cors_config)
def healthcheck():
    # These functions must return True or False :-)
    checks = [
        lambda: len(secrets.MBTA_V2_API_KEY) > 0,
        lambda: "2020-11-07 10:33:40" in json.dumps(data_funcs.headways(date(year=2020, month=11, day=7), ["70061"]))
    ]

    for i in range(0, len(checks)):
        try:
            checks[i] = checks[i]()
        except Exception:
            checks[i] = False

    if all(checks):
        return {
            "status": "pass"
        }

    return Response(body={
        "status": "fail",
        "check_failed": checks.index(False),
    }, status_code=500)


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
    return json.dumps(data_funcs.alerts(date, mutlidict_to_dict(app.current_request.query_params)))


@app.route("/aggregate/traveltimes", cors=cors_config)
def traveltime_aggregate_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    from_stop = app.current_request.query_params["from_stop"]
    to_stop = app.current_request.query_params["to_stop"]

    response = aggregation.travel_times_over_time(sdate, edate, from_stop, to_stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/aggregate/headways", cors=cors_config)
def headways_aggregate_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    stop = app.current_request.query_params["stop"]

    response = aggregation.headways_over_time(sdate, edate, stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/aggregate/dwells", cors=cors_config)
def dwells_aggregate_route():
    sdate = parse_user_date(app.current_request.query_params["start_date"])
    edate = parse_user_date(app.current_request.query_params["end_date"])
    stop = app.current_request.query_params["stop"]

    response = aggregation.dwells_over_time(sdate, edate, stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/git_id", cors=cors_config)
def get_git_id():
    # Only do this on localhost
    if TM_FRONTEND_HOST == "localhost":
        git_id = str(subprocess.check_output(['git', 'describe', '--always', '--dirty', '--abbrev=10']))[2:-3]
        return json.dumps({"git_id": git_id})
    else:
        raise ConflictError("Cannot get git id from serverless host")

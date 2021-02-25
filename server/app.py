import json
import os
from chalice import Chalice, Cron, CORSConfig
from datetime import date, timedelta
from chalicelib import data_funcs, s3_historical, s3_alerts

app = Chalice(app_name="data-dashboard")

TM_FRONTEND_HOST = os.environ["TM_FRONTEND_HOST"]

cors_config = CORSConfig(
    allow_origin=f"https://{TM_FRONTEND_HOST}", max_age=3600
)


# Every day at 10am UTC: store alerts from the past
# It's called yesterday for now but it's really two days ago!!
@app.schedule(Cron(0, 10, '*', '*', '?', '*'))
def store_yesterday_alerts(event):
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


def use_S3(date):
    return (date.today() - date).days >= 90


@app.route("/headways/{user_date}", cors=cors_config)
def headways_route(user_date):
    date = parse_user_date(user_date)
    if use_S3(date):
        stop = app.current_request.query_params["stop"]
        return s3_historical.headways(stop, date.year, date.month, date.day)
    else:
        return data_funcs.headways(
            date, mutlidict_to_dict(app.current_request.query_params)
        )


@app.route("/dwells/{user_date}", cors=cors_config)
def dwells_route(user_date):
    date = parse_user_date(user_date)
    if use_S3(date):
        stop = app.current_request.query_params["stop"]
        return s3_historical.dwells(stop, date.year, date.month, date.day)
    else:
        return data_funcs.dwells(date, mutlidict_to_dict(app.current_request.query_params))


@app.route("/traveltimes/{user_date}", cors=cors_config)
def traveltime_route(user_date):
    date = parse_user_date(user_date)
    if use_S3(date):
        from_stop = app.current_request.query_params["from_stop"]
        to_stop = app.current_request.query_params["to_stop"]
        return s3_historical.travel_times(from_stop, to_stop, date.year, date.month, date.day)
    else:
        return data_funcs.travel_times(
            date, mutlidict_to_dict(app.current_request.query_params)
        )


@app.route("/alerts/{user_date}", cors=cors_config)
def alerts_route(user_date):
    date = parse_user_date(user_date)
    return json.dumps(data_funcs.alerts(date, mutlidict_to_dict(app.current_request.query_params)))

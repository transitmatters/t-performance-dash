from chalice import Chalice, CORSConfig
from datetime import date
from chalicelib import data_funcs

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
    return data_funcs.headways(
        date, mutlidict_to_dict(app.current_request.query_params)
    )


@app.route("/dwells/{user_date}", cors=cors_config)
def dwells_route(user_date):
    date = parse_user_date(user_date)
    return data_funcs.dwells(date, mutlidict_to_dict(app.current_request.query_params))


@app.route("/traveltimes/{user_date}", cors=cors_config)
def traveltime_route(user_date):
    date = parse_user_date(user_date)
    return data_funcs.travel_times(
        date, mutlidict_to_dict(app.current_request.query_params)
    )


@app.route("/alerts/{user_date}", cors=cors_config)
def alerts_route(user_date):
    date = parse_user_date(user_date)
    return data_funcs.alerts(date, mutlidict_to_dict(app.current_request.query_params))

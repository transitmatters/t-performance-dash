import json
from chalice import Chalice
from datetime import datetime, timedelta, date, time
from chalicelib import data_funcs

app = Chalice(app_name='data-dashboard')

def destructure_date(date):
    date_split = date.split('-')
    return {
        'year': int(date_split[0]),
        'month': int(date_split[1]),
        'day': int(date_split[2])
    }

@app.route("/headways/{user_date}")
def headways_route(user_date):
    station = app.current_request.query_params.get('station')
    parsed_date = destructure_date(user_date)
    return data_funcs.headways(date(year=parsed_date['year'], month=parsed_date['month'], day=parsed_date['day']), {"stop": station})


@app.route("/dwells/{user_date}")
def dwells_route(user_date):
    station = app.current_request.query_params.get('station')
    parsed_date = destructure_date(user_date)
    return data_funcs.dwells(date(year=parsed_date['year'], month=parsed_date['month'], day=parsed_date['day']), {"stop": station})


@app.route("/traveltimes/{user_date}")
def traveltime_route(user_date):
    station_from = app.current_request.query_params.get('station_from')
    station_to = app.current_request.query_params.get('station_to')
    parsed_date = destructure_date(user_date)
    return data_funcs.travel_times(
            date(year=parsed_date['year'], month=parsed_date['month'], day=parsed_date['day']), {"from_stop": station_from, "to_stop": station_to}
        )

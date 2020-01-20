import json
import flask
from datetime import datetime, timedelta, date, time
import data_funcs

app = flask.Flask(__name__)

def destructure_date(date):
    date_split = date.split('-')
    return {
        'year': int(date_split[0]),
        'month': int(date_split[1]),
        'day': int(date_split[2])
    }

@app.route("/headways/<user_date>")
def headways_route(user_date):
    station = flask.request.args.get('station')
    parsed_date = destructure_date(user_date)
    return flask.jsonify(
        data_funcs.headways(date(year=parsed_date['year'], month=parsed_date['month'], day=parsed_date['day']), {"stop": station})
    )


@app.route("/dwells/<user_date>")
def dwells_route(user_date):
    station = flask.request.args.get('station')
    parsed_date = destructure_date(user_date)
    return flask.jsonify(
        data_funcs.dwells(date(year=parsed_date['year'], month=parsed_date['month'], day=parsed_date['day']), {"stop": station})
    )


@app.route("/traveltimes/<user_date>")
def traveltime_route(user_date):
    station_from = flask.request.args.get('station_from')
    station_to = flask.request.args.get('station_to')
    parsed_date = destructure_date(user_date)
    return flask.jsonify(
        data_funcs.travel_times(
            date(year=parsed_date['year'], month=parsed_date['month'], day=parsed_date['day']), {"from_stop": station_from, "to_stop": station_to}
        )
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)

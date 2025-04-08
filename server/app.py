import json
import os
import subprocess
from chalice import CORSConfig, ConflictError, Response, ConvertToMiddleware
from chalice_spec import ChaliceWithSpec, PydanticPlugin, Docs
from apispec import APISpec
from datetime import date
from datadog_lambda.wrapper import datadog_lambda_wrapper
from chalicelib import (
    aggregation,
    data_funcs,
    secrets,
    delays,
    mbta_v3,
    speed,
    speed_restrictions,
    scheduled_service,
    service_hours,
    predictions,
    ridership,
    models,
)


spec = APISpec(
    title="Data Dashboard API",
    version="1.0.0",
    openapi_version="3.0.0",
    plugins=[PydanticPlugin()],
)
app = ChaliceWithSpec(app_name="data-dashboard", spec=spec, generate_default_docs=True)

localhost = "localhost:3000"
TM_FRONTEND_HOST = os.environ.get("TM_FRONTEND_HOST", localhost)

cors_config = CORSConfig(allow_origin=f"https://{TM_FRONTEND_HOST}", max_age=3600)

if TM_FRONTEND_HOST != localhost:
    app.register_middleware(ConvertToMiddleware(datadog_lambda_wrapper))


def parse_user_date(user_date: str):
    date_split = user_date.split("-")
    [year, month, day] = [int(x) for x in date_split[0:3]]
    return date(year=year, month=month, day=day)


def mutlidict_to_dict(mutlidict):
    res_dict = {}
    for key in mutlidict.keys():
        res_dict[key] = mutlidict.getlist(key)
    return res_dict


@app.route("/api/healthcheck", cors=cors_config, docs=Docs(response=models.HealthcheckResponse))
def healthcheck():
    # These functions must return True or False :-)
    checks = {
        "API Key Present": (lambda: len(secrets.MBTA_V3_API_KEY) > 0),
        "S3 Headway Fetching": (
            lambda: "2020-11-07T10:33:40"
            in json.dumps(data_funcs.headways(date(year=2020, month=11, day=7), ["70061"]))
        ),
    }

    failed_checks = {}
    for check in checks:
        try:
            check_bool = checks[check]()
            if not check_bool:
                failed_checks[check] = "Check failed :("
        except Exception as e:
            e_str = str(e)
            for secret in secrets.HEALTHCHECK_HIDE_SECRETS:
                e_str.replace(secret, "HIDDEN")
            failed_checks[check] = f"Check threw an exception: {e_str}"

    if len(failed_checks) == 0:
        return Response(body={"status": "pass"}, status_code=200)

    return Response(
        body={
            "status": "fail",
            "failed_checks_sum": len(failed_checks),
            "failed_checks": failed_checks,
        },
        status_code=500,
    )


@app.route("/api/headways/{user_date}", cors=cors_config, docs=Docs(response=models.HeadwayResponse))
def headways_route(user_date):
    date = parse_user_date(user_date)
    stops = app.current_request.query_params.getlist("stop")
    return data_funcs.headways(date, stops)


@app.route("/api/dwells/{user_date}", cors=cors_config, docs=Docs(response=models.DwellResponse))
def dwells_route(user_date):
    date = parse_user_date(user_date)
    stops = app.current_request.query_params.getlist("stop")
    return data_funcs.dwells(date, stops)


@app.route("/api/traveltimes/{user_date}", cors=cors_config, docs=Docs(response=models.TravelTimeResponse))
def traveltime_route(user_date):
    date = parse_user_date(user_date)
    from_stops = app.current_request.query_params.getlist("from_stop")
    to_stops = app.current_request.query_params.getlist("to_stop")
    return data_funcs.travel_times(date, from_stops, to_stops)


@app.route("/api/alerts/{user_date}", cors=cors_config, docs=Docs(response=models.AlertsRouteResponse))
def alerts_route(user_date):
    date = parse_user_date(user_date)
    return json.dumps(data_funcs.alerts(date, mutlidict_to_dict(app.current_request.query_params)))


@app.route("/api/aggregate/traveltimes", cors=cors_config, docs=Docs(response=models.TravelTimeAggregateResponse))
def traveltime_aggregate_route():
    start_date = parse_user_date(app.current_request.query_params["start_date"])
    end_date = parse_user_date(app.current_request.query_params["end_date"])
    from_stops = app.current_request.query_params.getlist("from_stop")
    to_stops = app.current_request.query_params.getlist("to_stop")

    response = aggregation.travel_times_over_time(start_date, end_date, from_stops, to_stops)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/api/aggregate/traveltimes2", cors=cors_config, docs=Docs(response=models.TravelTimeAggregateResponse))
def traveltime_aggregate_route_2():
    start_date = parse_user_date(app.current_request.query_params["start_date"])
    end_date = parse_user_date(app.current_request.query_params["end_date"])
    from_stop = app.current_request.query_params.getlist("from_stop")
    to_stop = app.current_request.query_params.getlist("to_stop")

    response = aggregation.travel_times_all(start_date, end_date, from_stop, to_stop)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/api/aggregate/headways", cors=cors_config, docs=Docs(response=models.HeadwaysAggregateResponse))
def headways_aggregate_route():
    start_date = parse_user_date(app.current_request.query_params["start_date"])
    end_date = parse_user_date(app.current_request.query_params["end_date"])
    stops = app.current_request.query_params.getlist("stop")

    response = aggregation.headways_over_time(start_date, end_date, stops)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/api/aggregate/dwells", cors=cors_config, docs=Docs(response=models.DwellsAggregateResponse))
def dwells_aggregate_route():
    start_date = parse_user_date(app.current_request.query_params["start_date"])
    end_date = parse_user_date(app.current_request.query_params["end_date"])
    stops = app.current_request.query_params.getlist("stop")

    response = aggregation.dwells_over_time(start_date, end_date, stops)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route("/api/git_id", cors=cors_config, docs=Docs(response=models.GitIdResponse))
def get_git_id():
    # Only do this on localhost
    if TM_FRONTEND_HOST == "localhost":
        git_id = str(subprocess.check_output(["git", "describe", "--always", "--dirty", "--abbrev=10"]))[2:-3]
        return json.dumps({"git_id": git_id})
    else:
        raise ConflictError("Cannot get git id from serverless host")


@app.route("/api/alerts", cors=cors_config, docs=Docs(response=models.AlertsRouteResponse))
def get_alerts():
    response = mbta_v3.getAlerts(app.current_request.query_params)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route(
    "/api/linedelays",
    cors=cors_config,
    docs=Docs(request=models.AlertDelaysByLineParams, response=models.LineDelaysResponse),
)
def get_delays_by_line():
    response = delays.delay_time_by_line(app.current_request.query_params)
    return json.dumps(response, indent=4, sort_keys=True)


@app.route(
    "/api/tripmetrics",
    cors=cors_config,
    docs=Docs(request=models.TripMetricsByLineParams, response=models.TripMetricsResponse),
)
def get_trips_by_line():
    response = speed.trip_metrics_by_line(app.current_request.query_params)
    return json.dumps(response, indent=4, sort_keys=True)


@app.route(
    "/api/scheduledservice",
    cors=cors_config,
    docs=Docs(request=models.ScheduledServiceParams, response=models.GetScheduledServiceResponse),
)
def get_scheduled_service():
    query = app.current_request.query_params
    start_date = parse_user_date(query["start_date"])
    end_date = parse_user_date(query["end_date"])
    route_id = query.get("route_id")
    agg = query["agg"]
    response = scheduled_service.get_scheduled_service_counts(
        start_date=start_date,
        end_date=end_date,
        route_id=route_id,
        agg=agg,
    )
    return json.dumps(response)


@app.route(
    "/api/ridership", cors=cors_config, docs=Docs(request=models.RidershipParams, response=models.RidershipResponse)
)
def get_ridership():
    query = app.current_request.query_params
    start_date = parse_user_date(query["start_date"])
    end_date = parse_user_date(query["end_date"])
    line_id = query.get("line_id")
    response = ridership.get_ridership(
        start_date=start_date,
        end_date=end_date,
        line_id=line_id,
    )
    return json.dumps(response)


@app.route("/api/facilities", cors=cors_config, docs=Docs(response=models.Facility))
def get_facilities():
    response = mbta_v3.getV3("facilities", app.current_request.query_params)
    return json.dumps(response, indent=4, sort_keys=True, default=str)


@app.route(
    "/api/speed_restrictions",
    cors=cors_config,
    docs=Docs(request=models.SpeedRestrictionsParams, response=models.SpeedRestrictionsResponse),
)
def get_speed_restrictions():
    query = app.current_request.query_params
    on_date = query["date"]
    line_id = query["line_id"]
    response = speed_restrictions.query_speed_restrictions(
        line_id=line_id,
        on_date=on_date,
    )
    return json.dumps(response)


@app.route(
    "/api/service_hours",
    cors=cors_config,
    docs=Docs(request=models.ServiceHoursParams, response=models.ServiceHoursResponse),
)
def get_service_hours():
    query = app.current_request.query_params
    line_id = query.get("line_id")
    start_date = parse_user_date(query["start_date"])
    end_date = parse_user_date(query["end_date"])
    agg = query["agg"]
    response = service_hours.get_service_hours(
        single_route_id=line_id,
        start_date=start_date,
        end_date=end_date,
        agg=agg,
    )
    return json.dumps(response)


@app.route("/api/time_predictions", cors=cors_config, docs=Docs(response=models.TimePredictionResponse))
def get_time_predictions():
    query = app.current_request.query_params
    route_id = query["route_id"]
    response = predictions.query_time_predictions(
        route_id=route_id,
    )
    return json.dumps(response)

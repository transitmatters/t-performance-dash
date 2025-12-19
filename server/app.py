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
    cache,
    config,
    data_funcs,
    delays,
    mbta_v3,
    models,
    predictions,
    ridership,
    scheduled_service,
    service_hours,
    service_ridership_dashboard,
    speed,
    speed_restrictions,
    static_data,
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
        "API Key Present": (lambda: len(config.MBTA_V3_API_KEY) > 0),
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
            for secret in config.HEALTHCHECK_HIDE_SECRETS:
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
    stops = app.current_request.query_params.getlist("stop")
    cache_max_age = cache.get_cache_max_age({"date": user_date})

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_headways(user_date, stops)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request(f"/api/headways/{user_date}", {"stop": stops})
    else:
        date = parse_user_date(user_date)
        data = data_funcs.headways(date, stops)

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/dwells/{user_date}", cors=cors_config, docs=Docs(response=models.DwellResponse))
def dwells_route(user_date):
    stops = app.current_request.query_params.getlist("stop")
    cache_max_age = cache.get_cache_max_age({"date": user_date})

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_dwells(user_date, stops)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request(f"/api/dwells/{user_date}", {"stop": stops})
    else:
        date = parse_user_date(user_date)
        data = data_funcs.dwells(date, stops)

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/traveltimes/{user_date}", cors=cors_config, docs=Docs(response=models.TravelTimeResponse))
def traveltime_route(user_date):
    from_stops = app.current_request.query_params.getlist("from_stop")
    to_stops = app.current_request.query_params.getlist("to_stop")
    cache_max_age = cache.get_cache_max_age({"date": user_date})

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_traveltimes(user_date, from_stops, to_stops)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request(
            f"/api/traveltimes/{user_date}", {"from_stop": from_stops, "to_stop": to_stops}
        )
    else:
        date = parse_user_date(user_date)
        data = data_funcs.travel_times(date, from_stops, to_stops)

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/alerts/{user_date}", cors=cors_config, docs=Docs(response=models.AlertsRouteResponse))
def alerts_route(user_date):
    query_params = mutlidict_to_dict(app.current_request.query_params)
    cache_max_age = cache.get_cache_max_age({"date": user_date})

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_alerts(user_date, query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request(f"/api/alerts/{user_date}", query_params)
    else:
        date = parse_user_date(user_date)
        data = data_funcs.alerts(date, query_params)

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/traveltimes", cors=cors_config, docs=Docs(response=models.TravelTimeAggregateResponse))
def traveltime_aggregate_route():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_aggregate_traveltimes(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/aggregate/traveltimes", query_params)
    else:
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        from_stops = query_params.getlist("from_stop")
        to_stops = query_params.getlist("to_stop")
        data = aggregation.travel_times_over_time(start_date, end_date, from_stops, to_stops)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/traveltimes2", cors=cors_config, docs=Docs(response=models.TravelTimeAggregateResponse))
def traveltime_aggregate_route_2():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_aggregate_traveltimes(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/aggregate/traveltimes2", query_params)
    else:
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        from_stop = query_params.getlist("from_stop")
        to_stop = query_params.getlist("to_stop")
        data = aggregation.travel_times_all(start_date, end_date, from_stop, to_stop)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/headways", cors=cors_config, docs=Docs(response=models.HeadwaysAggregateResponse))
def headways_aggregate_route():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_aggregate_headways(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/aggregate/headways", query_params)
    else:
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        stops = query_params.getlist("stop")
        data = aggregation.headways_over_time(start_date, end_date, stops)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/dwells", cors=cors_config, docs=Docs(response=models.DwellsAggregateResponse))
def dwells_aggregate_route():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_aggregate_dwells(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/aggregate/dwells", query_params)
    else:
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        stops = query_params.getlist("stop")
        data = aggregation.dwells_over_time(start_date, end_date, stops)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


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
    data = mbta_v3.getAlerts(app.current_request.query_params)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache.FIFTEEN_MINUTES}"},
    )


@app.route(
    "/api/linedelays",
    cors=cors_config,
    docs=Docs(request=models.AlertDelaysByLineParams, response=models.LineDelaysResponse),
)
def get_delays_by_line():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_line_delays(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/linedelays", query_params)
    else:
        data = delays.delay_time_by_line(query_params)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route(
    "/api/tripmetrics",
    cors=cors_config,
    docs=Docs(request=models.TripMetricsByLineParams, response=models.TripMetricsResponse),
)
def get_trips_by_line():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_trip_metrics(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/tripmetrics", query_params)
    else:
        data = speed.trip_metrics_by_line(query_params)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route(
    "/api/scheduledservice",
    cors=cors_config,
    docs=Docs(request=models.ScheduledServiceParams, response=models.GetScheduledServiceResponse),
)
def get_scheduled_service():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_scheduled_service(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/scheduledservice", query_params)
    else:
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        route_id = query_params.get("route_id")
        agg = query_params["agg"]
        data = scheduled_service.get_scheduled_service_counts(
            start_date=start_date,
            end_date=end_date,
            route_id=route_id,
            agg=agg,
        )

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route(
    "/api/ridership", cors=cors_config, docs=Docs(request=models.RidershipParams, response=models.RidershipResponse)
)
def get_ridership():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_ridership(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/ridership", query_params)
    else:
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        line_id = query_params.get("line_id")
        data = ridership.get_ridership(
            start_date=start_date,
            end_date=end_date,
            line_id=line_id,
        )

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/facilities", cors=cors_config, docs=Docs(response=models.Facility))
def get_facilities():
    data = mbta_v3.getV3("facilities", app.current_request.query_params)

    return Response(
        body=json.dumps(data, indent=4, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache.FIFTEEN_MINUTES}"},
    )


@app.route(
    "/api/speed_restrictions",
    cors=cors_config,
    docs=Docs(request=models.SpeedRestrictionsParams, response=models.SpeedRestrictionsResponse),
)
def get_speed_restrictions():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_speed_restrictions(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/speed_restrictions", query_params)
    else:
        on_date = query_params["date"]
        line_id = query_params["line_id"]
        data = speed_restrictions.query_speed_restrictions(
            line_id=line_id,
            on_date=on_date,
        )

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route(
    "/api/service_hours",
    cors=cors_config,
    docs=Docs(request=models.ServiceHoursParams, response=models.ServiceHoursResponse),
)
def get_service_hours():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_service_hours(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/service_hours", query_params)
    else:
        line_id = query_params.get("line_id")
        start_date = parse_user_date(query_params["start_date"])
        end_date = parse_user_date(query_params["end_date"])
        agg = query_params["agg"]
        data = service_hours.get_service_hours(
            single_route_id=line_id,
            start_date=start_date,
            end_date=end_date,
            agg=agg,
        )

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/time_predictions", cors=cors_config, docs=Docs(response=models.TimePredictionResponse))
def get_time_predictions():
    query_params = app.current_request.query_params or {}

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_time_predictions(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/time_predictions", query_params)
    else:
        route_id = query_params["route_id"]
        data = predictions.query_time_predictions(
            route_id=route_id,
        )

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache.ONE_HOUR}"},
    )


@app.route(
    "/api/service_ridership_dashboard",
    cors=cors_config,
    docs=Docs(response=models.ServiceRidershipDashboardResponse),
)
def get_service_ridership_dashboard():
    if config.BACKEND_SOURCE == "static":
        data = static_data.get_service_ridership_dashboard()
    elif config.BACKEND_SOURCE == "prod":
        data = json.dumps(static_data.proxy_request("/api/service_ridership_dashboard", {}))
    else:
        data = service_ridership_dashboard.get_service_ridership_dash_json()

    return Response(
        body=data,
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache.ONE_HOUR}"},
    )

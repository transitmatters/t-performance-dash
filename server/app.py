"""Chalice application defining the Data Dashboard REST API endpoints."""

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
    dynamo,
    mbta_v3,
    route_manifest,
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

# Initialize DynamoDB resource based on backend source
if config.BACKEND_SOURCE == "aws":
    dynamo.set_dynamodb_resource()
    speed_restrictions.set_speed_restrictions_table()
    predictions.set_time_predictions_table()


def parse_user_date(user_date: str):
    """Parse a user-provided date string in YYYY-MM-DD format into a date object.

    Args:
      user_date: str: Date string in "YYYY-MM-DD" format.

    Returns:
      date: A datetime.date object.
    """
    date_split = user_date.split("-")
    [year, month, day] = [int(x) for x in date_split[0:3]]
    return date(year=year, month=month, day=day)


TWO_YEARS_DAYS = 730


def is_large_date_range(query_params):
    start = query_params.get("start_date")
    end = query_params.get("end_date")
    if not start or not end:
        return False
    return (parse_user_date(end) - parse_user_date(start)).days > TWO_YEARS_DAYS


def mutlidict_to_dict(mutlidict):
    """Convert a Chalice MultiDict to a plain dict, preserving multiple values per key as lists.

    Args:
      mutlidict: A Chalice MultiDict from query parameters.

    Returns:
      dict: A dict mapping each key to a list of its values.
    """
    res_dict = {}
    for key in mutlidict.keys():
        res_dict[key] = mutlidict.getlist(key)
    return res_dict


@app.route("/api/healthcheck", cors=cors_config, docs=Docs(response=models.HealthcheckResponse))
def healthcheck():
    """Run API health checks and return pass/fail status with details on any failures."""
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
    """Retrieve headway data for the given date and stop(s).

    Args:
      user_date: Date string in "YYYY-MM-DD" format.
      Query params - stop: One or more stop IDs.

    Returns:
      Response: JSON response containing headway event data.
    """
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
    """Retrieve dwell time data for the given date and stop(s).

    Args:
      user_date: Date string in "YYYY-MM-DD" format.
      Query params - stop: One or more stop IDs.

    Returns:
      Response: JSON response containing dwell time event data.
    """
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
    """Retrieve travel time data between stop pairs for the given date.

    Args:
      user_date: Date string in "YYYY-MM-DD" format.
      Query params - from_stop: One or more origin stop IDs.
      Query params - to_stop: One or more destination stop IDs.

    Returns:
      Response: JSON response containing travel time event data.
    """
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
    """Retrieve transit alerts for the given date and route(s).

    Args:
      user_date: Date string in "YYYY-MM-DD" format.
      Query params - route: One or more route IDs.

    Returns:
      Response: JSON response containing alert data.
    """
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
    """Retrieve aggregated travel time data over a date range, grouped by date."""
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

    indent = None if is_large_date_range(query_params) else 4
    return Response(
        body=json.dumps(data, indent=indent, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/traveltimes2", cors=cors_config, docs=Docs(response=models.TravelTimeAggregateResponse))
def traveltime_aggregate_route_2():
    """Retrieve aggregated travel time data with by-time-of-day and by-date breakdowns."""
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

    indent = None if is_large_date_range(query_params) else 4
    return Response(
        body=json.dumps(data, indent=indent, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/headways", cors=cors_config, docs=Docs(response=models.HeadwaysAggregateResponse))
def headways_aggregate_route():
    """Retrieve aggregated headway data over a date range for the given stop(s)."""
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

    indent = None if is_large_date_range(query_params) else 4
    return Response(
        body=json.dumps(data, indent=indent, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/aggregate/dwells", cors=cors_config, docs=Docs(response=models.DwellsAggregateResponse))
def dwells_aggregate_route():
    """Retrieve aggregated dwell time data over a date range for the given stop(s)."""
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

    indent = None if is_large_date_range(query_params) else 4
    return Response(
        body=json.dumps(data, indent=indent, sort_keys=True, default=str),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache_max_age}"},
    )


@app.route("/api/git_id", cors=cors_config, docs=Docs(response=models.GitIdResponse))
def get_git_id():
    """Return the current git commit ID. Only available on localhost."""
    # Only do this on localhost
    if TM_FRONTEND_HOST == "localhost":
        git_id = str(subprocess.check_output(["git", "describe", "--always", "--dirty", "--abbrev=10"]))[2:-3]
        return json.dumps({"git_id": git_id})
    else:
        raise ConflictError("Cannot get git id from serverless host")


@app.route("/api/alerts", cors=cors_config, docs=Docs(response=models.AlertsRouteResponse))
def get_alerts():
    """Fetch current live alerts from the MBTA v3 API."""
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
    """Retrieve alert-based delay data aggregated by line over a date range."""
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
    """Retrieve trip metrics (speed, travel time, etc.) aggregated by line over a date range."""
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
    """Retrieve scheduled service counts for a route over a date range."""
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
    """Retrieve ridership data for a line over a date range."""
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
    """Fetch facility data (elevators, escalators) from the MBTA v3 API."""
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
    """Retrieve speed restriction data for a line on a given date."""
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
    """Retrieve delivered service hours for a line over a date range."""
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
    """Retrieve time prediction accuracy data for a route."""
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
    """Retrieve combined service and ridership data for the overview dashboard."""
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


@app.route("/api/routes", cors=cors_config, docs=Docs(response=models.RoutesResponse))
def get_routes():
    """Get a manifest of all available routes supported in the dashboard.

    Returns:
        Response: JSON response containing route IDs grouped by category
            (rapid_transit, bus, commuter_rail, ferry), cached for one day.
    """
    data = route_manifest.get_all_routes_manifest()

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache.ONE_DAY}"},
    )


@app.route("/api/stops/{route_id}", cors=cors_config, docs=Docs(response=models.StopsResponse))
def get_stops(route_id):
    """Get the stop information for a specific route.

    Args:
        route_id: The route ID to look up stops for.

    Returns:
        Response: JSON response containing station/stop data including names, IDs,
            and directions, or a 404 response if the route is not found.
    """
    data = route_manifest.get_route_stops(route_id)

    if data is None:
        return Response(
            body=json.dumps({"error": f"Route '{route_id}' not found"}),
            status_code=404,
            headers={"Content-Type": "application/json"},
        )

    return Response(
        body=json.dumps(data),
        headers={"Content-Type": "application/json", "Cache-Control": f"public, max-age={cache.ONE_DAY}"},
    )

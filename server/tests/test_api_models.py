"""Validate captured production responses against the response models and the generated OpenAPI spec.

Fixtures live in tests/fixtures/api_samples/<endpoint>/<case>.json and are captured from production
with `uv run python -m scripts.capture_api_samples`. Every fixture is checked twice:

- against its Pydantic model in strict mode, so a type mismatch (e.g. `"0"` where the model says
  integer) fails instead of being coerced; and
- against the response schema in openapi.json, which is what generated clients are built from.
"""

import json
from pathlib import Path
from typing import get_args, get_type_hints

import pytest
from openapi_schema_validator import OAS30Validator

from chalicelib import config, delays, models, sampling, speed
from scripts.generate_openapi import add_operation_ids

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "api_samples"
SPEC_PATH = Path(__file__).parent.parent / "openapi.json"
MANIFEST = json.loads((FIXTURES_DIR / "manifest.json").read_text())

# Fixture directory -> (API path, response model) for successful (HTTP 200) responses
ENDPOINTS = {
    "headways": ("/api/headways/{user_date}", models.HeadwayResponse),
    "dwells": ("/api/dwells/{user_date}", models.DwellResponse),
    "traveltimes": ("/api/traveltimes/{user_date}", models.TravelTimeResponse),
    "alerts_by_date": ("/api/alerts/{user_date}", models.AlertsRouteResponse),
    "alerts_live": ("/api/alerts", models.LiveAlertsResponse),
    "facilities": ("/api/facilities", models.FacilitiesResponse),
    "aggregate_traveltimes": ("/api/aggregate/traveltimes", models.TravelTimeAggregateResponse),
    "aggregate_traveltimes2": ("/api/aggregate/traveltimes2", models.TravelTimeAggregate2Response),
    "aggregate_headways": ("/api/aggregate/headways", models.HeadwaysAggregateResponse),
    "aggregate_dwells": ("/api/aggregate/dwells", models.DwellsAggregateResponse),
    "linedelays": ("/api/linedelays", models.LineDelaysResponse),
    "shutdowns": ("/api/shutdowns", models.ShutdownsResponse),
    "tripmetrics": ("/api/tripmetrics", models.TripMetricsResponse),
    "bustripmetrics": ("/api/bustripmetrics", models.BusTripMetricsResponse),
    "crtripmetrics": ("/api/crtripmetrics", models.CrTripMetricsResponse),
    "busspeedleaderboard": ("/api/busspeedleaderboard", models.BusSpeedLeaderboardResponse),
    "service_hours": ("/api/service_hours", models.ServiceHoursResponse),
    "time_predictions": ("/api/time_predictions", models.TimePredictionResponse),
    "ridership": ("/api/ridership", models.RidershipResponse),
    "station_ridership": ("/api/station_ridership", models.StationRidershipResponse),
    "reliability": ("/api/reliability", models.ReliabilityResponse),
    "crscorecard": ("/api/crscorecard", models.CrScorecardResponse),
    "weather": ("/api/weather", models.WeatherResponse),
    "scheduledservice": ("/api/scheduledservice", models.GetScheduledServiceResponse),
    "speed_restrictions": ("/api/speed_restrictions", models.SpeedRestrictionsResponse),
    "service_ridership_dashboard": ("/api/service_ridership_dashboard", models.ServiceRidershipDashboardResponse),
    "routes": ("/api/routes", models.RoutesResponse),
    "stops": ("/api/stops/{route_id}", models.StopsResponse),
    "healthcheck": ("/api/healthcheck", models.HealthcheckResponse),
}

# Error fixtures in errors/ -> (API path, HTTP status, error model)
ERRORS = {
    "headways_invalid_date": ("/api/headways/{user_date}", 400, models.ErrorResponse),
    "aggregate_headways_missing_dates": ("/api/aggregate/headways", 400, models.ErrorResponse),
    "linedelays_unsupported_agg": ("/api/linedelays", 400, models.ErrorResponse),
    "tripmetrics_range_too_long": ("/api/tripmetrics", 403, models.ErrorResponse),
    "bustripmetrics_unknown_time_band": ("/api/bustripmetrics", 400, models.ErrorResponse),
    "stops_unknown_route": ("/api/stops/{route_id}", 404, models.RouteNotFoundResponse),
}


def _fixture_cases():
    """Return (fixture name, API path, HTTP status, model) for every fixture."""
    cases = [
        (f"{endpoint}/{path.stem}", api_path, 200, model)
        for endpoint, (api_path, model) in sorted(ENDPOINTS.items())
        for path in sorted((FIXTURES_DIR / endpoint).glob("*.json"))
    ]
    cases += [(f"errors/{name}", api_path, status, model) for name, (api_path, status, model) in sorted(ERRORS.items())]
    return [pytest.param(*case, id=case[0]) for case in cases]


FIXTURE_CASES = _fixture_cases()


def _fixture_text(name):
    return (FIXTURES_DIR / f"{name}.json").read_text()


@pytest.fixture(scope="module")
def spec():
    return json.loads(SPEC_PATH.read_text())


def _resolve(spec, schema):
    while "$ref" in schema:
        schema = spec["components"]["schemas"][schema["$ref"].rsplit("/", 1)[-1]]
    return schema


def _response_schema(spec, path, status):
    return spec["paths"][path]["get"]["responses"][str(status)]["content"]["application/json"]["schema"]


@pytest.mark.parametrize("name,api_path,status,model", FIXTURE_CASES)
def test_fixture_matches_model(name, api_path, status, model):
    model.model_validate_json(_fixture_text(name), strict=True)


@pytest.mark.parametrize("name,api_path,status,model", FIXTURE_CASES)
def test_fixture_matches_spec(spec, name, api_path, status, model):
    # Bundle the components with the schema so its "#/components/schemas/..." references resolve
    schema = {**_response_schema(spec, api_path, status), "components": spec["components"]}
    OAS30Validator(schema).validate(json.loads(_fixture_text(name)))


@pytest.mark.parametrize("name,api_path,status,model", FIXTURE_CASES)
def test_fixture_status_matches_capture(name, api_path, status, model):
    assert MANIFEST[name]["status"] == status


def test_every_fixture_is_checked():
    fixtures = {str(path.relative_to(FIXTURES_DIR).with_suffix("")) for path in FIXTURES_DIR.glob("*/*.json")}
    assert fixtures == {case.values[0] for case in FIXTURE_CASES}


def test_every_endpoint_has_samples(spec):
    assert set(spec["paths"]) == {api_path for api_path, _ in ENDPOINTS.values()}
    for endpoint in ENDPOINTS:
        assert list((FIXTURES_DIR / endpoint).glob("*.json")), f"no samples for {endpoint}"


def test_production_is_the_default_server(spec):
    assert spec["servers"][0]["url"] == config.PRODUCTION_API


def test_date_parameters_are_dates(spec):
    date_params = [
        (path, param["name"], param["schema"])
        for path, path_item in spec["paths"].items()
        for param in path_item.get("parameters", []) + path_item["get"].get("parameters", [])
        if "date" in param["name"]
    ]
    assert date_params
    for path, name, schema in date_params:
        assert schema.get("format") == "date", f"{path} {name}"


def _free_form_objects(spec, schema, where, seen):
    """Yield the locations of objects in a schema that declare no properties and no value schema."""
    if "$ref" in schema:
        name = schema["$ref"].rsplit("/", 1)[-1]
        if name in seen:
            return
        seen.add(name)
        schema = _resolve(spec, schema)
        where = name
    if schema.get("type") == "object" and not schema.get("properties"):
        if not isinstance(schema.get("additionalProperties"), dict):
            yield where
    for key, child in schema.get("properties", {}).items():
        yield from _free_form_objects(spec, child, f"{where}.{key}", seen)
    for key in ("items", "additionalProperties"):
        if isinstance(schema.get(key), dict):
            yield from _free_form_objects(spec, schema[key], f"{where}[]", seen)
    for key in ("anyOf", "oneOf", "allOf"):
        for child in schema.get(key, []):
            yield from _free_form_objects(spec, child, where, seen)


def test_success_responses_are_not_free_form(spec):
    free_form = []
    for path, path_item in spec["paths"].items():
        for method, operation in path_item.items():
            if method == "parameters":
                continue
            for status, response in operation["responses"].items():
                if status.startswith("2"):
                    schema = response["content"]["application/json"]["schema"]
                    free_form += _free_form_objects(spec, schema, f"{method.upper()} {path}", set())
    assert free_form == []


def test_every_operation_has_a_unique_operation_id(spec):
    operation_ids = [
        operation.get("operationId")
        for path_item in spec["paths"].values()
        for method, operation in path_item.items()
        if method != "parameters"
    ]
    assert None not in operation_ids
    assert len(operation_ids) == len(set(operation_ids))


def test_operation_ids_required_for_new_routes():
    new_route = {"paths": {"/api/new_route": {"get": {"responses": {}}}}}
    with pytest.raises(ValueError, match="/api/new_route"):
        add_operation_ids(new_route)


# The `agg` enums must match the values each handler supports
_RESAMPLED_AGG = set(get_args(get_type_hints(sampling.resample_and_aggregate)["agg"]))


@pytest.mark.parametrize(
    "path,supported",
    [
        ("/api/linedelays", set(delays.AGG_TO_CONFIG_MAP)),
        ("/api/tripmetrics", set(speed.AGG_TO_CONFIG_MAP)),
        ("/api/scheduledservice", _RESAMPLED_AGG),
        ("/api/service_hours", _RESAMPLED_AGG),
    ],
)
def test_agg_param_lists_supported_values(spec, path, supported):
    (agg,) = [param for param in spec["paths"][path]["get"]["parameters"] if param["name"] == "agg"]
    assert set(agg["schema"]["enum"]) == supported

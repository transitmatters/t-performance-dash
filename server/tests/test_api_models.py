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

from chalicelib import delays, models, sampling, speed
from scripts.generate_openapi import add_operation_ids

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "api_samples"
SPEC_PATH = Path(__file__).parent.parent / "openapi.json"

# Fixture directory -> (API path, HTTP status, response model)
ENDPOINTS = {
    "headways": ("/api/headways/{user_date}", 200, models.HeadwayResponse),
    "dwells": ("/api/dwells/{user_date}", 200, models.DwellResponse),
    "traveltimes": ("/api/traveltimes/{user_date}", 200, models.TravelTimeResponse),
    "alerts_by_date": ("/api/alerts/{user_date}", 200, models.AlertsRouteResponse),
    "alerts_live": ("/api/alerts", 200, models.LiveAlertsResponse),
    "facilities": ("/api/facilities", 200, models.FacilitiesResponse),
    "aggregate_traveltimes": ("/api/aggregate/traveltimes", 200, models.TravelTimeAggregateResponse),
    "aggregate_traveltimes2": ("/api/aggregate/traveltimes2", 200, models.TravelTimeAggregate2Response),
    "aggregate_headways": ("/api/aggregate/headways", 200, models.HeadwaysAggregateResponse),
    "aggregate_dwells": ("/api/aggregate/dwells", 200, models.DwellsAggregateResponse),
    "linedelays": ("/api/linedelays", 200, models.LineDelaysResponse),
    "tripmetrics": ("/api/tripmetrics", 200, models.TripMetricsResponse),
    "service_hours": ("/api/service_hours", 200, models.ServiceHoursResponse),
    "time_predictions": ("/api/time_predictions", 200, models.TimePredictionResponse),
    "ridership": ("/api/ridership", 200, models.RidershipResponse),
    "scheduledservice": ("/api/scheduledservice", 200, models.GetScheduledServiceResponse),
    "speed_restrictions": ("/api/speed_restrictions", 200, models.SpeedRestrictionsResponse),
    "service_ridership_dashboard": (
        "/api/service_ridership_dashboard",
        200,
        models.ServiceRidershipDashboardResponse,
    ),
    "routes": ("/api/routes", 200, models.RoutesResponse),
    "stops": ("/api/stops/{route_id}", 200, models.StopsResponse),
    "healthcheck": ("/api/healthcheck", 200, models.HealthcheckResponse),
}

# Documented paths without captured samples: /api/git_id only works on a local development server.
UNSAMPLED_PATHS = {"/api/git_id"}


def _fixture_cases():
    return [
        pytest.param(endpoint, path, id=f"{endpoint}/{path.stem}")
        for endpoint in sorted(ENDPOINTS)
        for path in sorted((FIXTURES_DIR / endpoint).glob("*.json"))
    ]


@pytest.fixture(scope="module")
def spec():
    return json.loads(SPEC_PATH.read_text())


def _resolve(spec, schema):
    while "$ref" in schema:
        schema = spec["components"]["schemas"][schema["$ref"].rsplit("/", 1)[-1]]
    return schema


def _response_schema(spec, path, status):
    return spec["paths"][path]["get"]["responses"][str(status)]["content"]["application/json"]["schema"]


@pytest.mark.parametrize("endpoint,fixture_path", _fixture_cases())
def test_fixture_matches_model(endpoint, fixture_path):
    _, _, model = ENDPOINTS[endpoint]
    model.model_validate_json(fixture_path.read_text(), strict=True)


@pytest.mark.parametrize("endpoint,fixture_path", _fixture_cases())
def test_fixture_matches_spec(spec, endpoint, fixture_path):
    path, status, _ = ENDPOINTS[endpoint]
    # Bundle the components with the schema so its "#/components/schemas/..." references resolve
    schema = {**_response_schema(spec, path, status), "components": spec["components"]}
    OAS30Validator(schema).validate(json.loads(fixture_path.read_text()))


def test_every_fixture_directory_is_checked():
    directories = {path.name for path in FIXTURES_DIR.iterdir() if path.is_dir()}
    assert directories == set(ENDPOINTS)


def test_every_endpoint_has_samples(spec):
    sampled_paths = {path for path, _, _ in ENDPOINTS.values()}
    assert set(spec["paths"]) - UNSAMPLED_PATHS == sampled_paths
    for endpoint in ENDPOINTS:
        assert list((FIXTURES_DIR / endpoint).glob("*.json")), f"no samples for {endpoint}"


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

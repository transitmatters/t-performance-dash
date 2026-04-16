"""Pydantic models for API request parameters and response schemas.

All models use Pydantic v2 and serve as both runtime validation
and API documentation via `chalice-spec`.
"""

from datetime import date
from typing import List, Dict, Union, Any
from pydantic import BaseModel, ConfigDict

#################################################
# API Request Parameter Models
#################################################


class AlertDelaysByLineParams(BaseModel):
    """Parameters for the `/api/linedelays` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        line: Line identifier (e.g., `Red`, `Orange`, `Green-B`).
    """

    start_date: Union[str, date]
    end_date: Union[str, date]
    line: str


class TripMetricsByLineParams(BaseModel):
    """Parameters for the `/api/tripmetrics` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
        line: Line identifier (e.g., `Red`, `Green-B`).
    """

    start_date: Union[str, date]
    end_date: Union[str, date]
    agg: str
    line: str


class ScheduledServiceParams(BaseModel):
    """Parameters for the `/api/scheduledservice` endpoint.

    Attributes:
        start_date: Start of date range.
        end_date: End of date range.
        route_id: Optional route filter. `None` returns all routes.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    start_date: date
    end_date: date
    route_id: str | None = None
    agg: str


class RidershipParams(BaseModel):
    """Parameters for the `/api/ridership` endpoint.

    Attributes:
        start_date: Start of date range.
        end_date: End of date range.
        line_id: Optional line filter. `None` returns all lines.
    """

    start_date: date
    end_date: date
    line_id: str | None = None


class SpeedRestrictionsParams(BaseModel):
    """Parameters for the `/api/speed_restrictions` endpoint.

    Attributes:
        line_id: Line identifier (e.g., `Red`, `Orange`).
        on_date: Date to query (YYYY-MM-DD).
    """

    line_id: str
    on_date: str


class ServiceHoursParams(BaseModel):
    """Parameters for the `/api/service_hours` endpoint.

    Attributes:
        single_route_id: Optional route filter. `None` returns all routes.
        start_date: Start of date range.
        end_date: End of date range.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    single_route_id: str | None = None
    start_date: date
    end_date: date
    agg: str


#################################################
# API Response Models
#################################################


# Healthcheck
class HealthcheckResponse(BaseModel):
    """Response for `/api/healthcheck`.

    Attributes:
        status: `"pass"` or `"fail"`.
        failed_checks_sum: Number of failed checks, if any.
        failed_checks: Map of check name to failure detail.
    """

    status: str
    failed_checks_sum: int | None = None
    failed_checks: Dict[str, str] | None = None


# MBTA Resources
class Facility(BaseModel):
    """An MBTA facility (elevator, escalator, etc.) from the v3 API.

    Attributes:
        id: Facility identifier.
        type: Facility type (e.g., `ELEVATOR`, `ESCALATOR`).
        attributes: Raw facility attributes from the MBTA API.
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: str
    type: str
    attributes: Dict[str, Any]


class Alert(BaseModel):
    """A service alert with a validity window.

    Attributes:
        valid_from: ISO timestamp when the alert becomes active.
        valid_to: ISO timestamp when the alert expires.
        text: Human-readable alert description.
    """

    valid_from: str
    valid_to: str
    text: str


class AlertsRouteResponse(BaseModel):
    """Response for alert endpoints (`/api/alerts` and `/api/alerts/{date}`).

    Attributes:
        alerts: List of alert objects with type, active periods, stops, and routes.
    """

    model_config = ConfigDict(extra="allow")
    alerts: List[Dict[str, Any]]


# Performance Data
class HeadwayResponse(BaseModel):
    """Response for `/api/headways/{date}` — raw headway events for a single day.

    Attributes:
        headways: Headway data keyed by stop ID.
    """

    model_config = ConfigDict(extra="allow")
    headways: Dict[str, Any]


class DwellResponse(BaseModel):
    """Response for `/api/dwells/{date}` — raw dwell time events for a single day.

    Attributes:
        dwells: Dwell time data keyed by stop ID.
    """

    model_config = ConfigDict(extra="allow")
    dwells: Dict[str, Any]


class TravelTimeResponse(BaseModel):
    """Response for `/api/traveltimes/{date}` — raw travel time events for a single day.

    Attributes:
        travel_times: Travel time data keyed by origin-destination stop pair.
    """

    model_config = ConfigDict(extra="allow")
    travel_times: Dict[str, Any]


# Aggregated Data
class TravelTimeAggregateResponse(BaseModel):
    """Response for `/api/aggregate/traveltimes` and `/api/aggregate/traveltimes2`.

    Contains `by_date` and/or `by_time` sub-objects with statistical summaries.

    Attributes:
        data: Aggregated travel time statistics.
    """

    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class HeadwaysAggregateResponse(BaseModel):
    """Response for `/api/aggregate/headways`.

    Includes standard statistics plus bunching ratio and on-time percentage.

    Attributes:
        data: Aggregated headway statistics by date.
    """

    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class DwellsAggregateResponse(BaseModel):
    """Response for `/api/aggregate/dwells`.

    Attributes:
        data: Aggregated dwell time statistics by date.
    """

    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Line Metrics
class LineDelaysResponse(BaseModel):
    """Response for `/api/linedelays` — alert-based delay data for a transit line.

    Attributes:
        data: Delay data, daily or weekly depending on the `agg` parameter.
    """

    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class TripMetricsResponse(BaseModel):
    """Response for `/api/tripmetrics` — trip count, time, and miles for a line.

    Attributes:
        data: Trip metrics at the requested aggregation level.
    """

    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class ServiceHoursResponse(BaseModel):
    """Response for `/api/service_hours` — scheduled vs. delivered service hours.

    Attributes:
        data: Service hours comparison data.
    """

    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Predictions
class TimePredictionResponse(BaseModel):
    """Response for `/api/time_predictions` — time prediction model data.

    Attributes:
        predictions: Prediction model data for a route.
    """

    model_config = ConfigDict(extra="allow")
    predictions: Dict[str, Any]


# Ridership
class RidershipEntry(BaseModel):
    """A single day's ridership count.

    Attributes:
        date: Date string (YYYY-MM-DD).
        count: Ridership count for the day.
    """

    date: str
    count: int


class RidershipResponse(BaseModel):
    """Response for `/api/ridership` — daily ridership counts.

    Attributes:
        data: List of daily ridership entries.
    """

    model_config = ConfigDict(extra="allow")
    data: List[RidershipEntry]


# Service and Scheduling
class ServiceHoursEntry(BaseModel):
    """A single day's scheduled vs. delivered service hours.

    Attributes:
        date: Date string (YYYY-MM-DD).
        scheduled: Scheduled service hours.
        delivered: Delivered service hours.
    """

    date: str
    scheduled: int
    delivered: int


class ByHourServiceLevels(BaseModel):
    """Hourly service level breakdown.

    Attributes:
        service_levels: Service count by hour (24 entries, index 0 = midnight).
    """

    service_levels: List[int]


class ByDayKindServiceLevels(BaseModel):
    """Service levels for a specific day type (weekday, Saturday, or Sunday).

    Attributes:
        date: Reference date (YYYY-MM-DD).
        service_levels: Service count by hour (24 entries, index 0 = midnight).
    """

    date: str
    service_levels: List[int]


class ServiceLevelsByDayKind(BaseModel):
    """Service levels grouped by day type.

    Attributes:
        weekday: Weekday service breakdown.
        saturday: Saturday service breakdown.
        sunday: Sunday service breakdown.
    """

    weekday: ByDayKindServiceLevels
    saturday: ByDayKindServiceLevels
    sunday: ByDayKindServiceLevels


class GetScheduledServiceResponse(BaseModel):
    """Response for `/api/scheduledservice` — scheduled service counts and hours.

    Attributes:
        start_date_service_levels: Service levels at the start of the date range.
        end_date_service_levels: Service levels at the end of the date range.
        counts: Scheduled trip counts keyed by date string.
        service_hours: Service hours keyed by date string.
    """

    start_date_service_levels: ServiceLevelsByDayKind
    end_date_service_levels: ServiceLevelsByDayKind
    counts: Dict[str, int]
    service_hours: Dict[str, float]


# Speed Restrictions
class SpeedRestrictionsResponse(BaseModel):
    """Response for `/api/speed_restrictions` — speed restriction zones.

    Attributes:
        available: Whether speed restriction data exists for this date.
        date: Actual date of the data (may differ from requested date).
        zones: Speed restriction zone details, if available.
    """

    available: bool
    date: str | None = None
    zones: Dict | None = None


# Service/Ridership Dashboard
class ServiceRidershipDashboardResponse(BaseModel):
    """Response for `/api/service_ridership_dashboard` — system-wide summary.

    Attributes:
        summaryData: System-wide summary metrics.
        lineData: Per-line metrics.
    """

    summaryData: dict[str, Any]
    lineData: dict[str, Any]


# Misc Endpoints
class GitIdResponse(BaseModel):
    """Response for `/api/git_id` — current deployment's git commit.

    Attributes:
        git_id: Git commit hash of the deployed code.
    """

    git_id: str


class APIDocsResponse(BaseModel):
    """Response for the OpenAPI specification endpoint.

    Attributes:
        openapi: OpenAPI version string.
        info: API metadata (title, version, etc.).
        paths: API endpoint definitions.
        components: Reusable schema components.
    """

    model_config = ConfigDict(extra="allow")
    openapi: str
    info: Dict[str, Any]
    paths: Dict[str, Any]
    components: Dict[str, Any]


# Route Manifest Endpoints
class RoutesResponse(BaseModel):
    """Response for `/api/routes` — lists all available routes by transit mode.

    Attributes:
        rapid_transit: Rapid transit route IDs (e.g., `Red`, `Orange`, `Green-B`).
        bus: Bus route IDs.
        commuter_rail: Commuter rail route IDs (e.g., `CR-Fairmount`).
        ferry: Ferry route IDs (e.g., `Boat-F1`).
    """

    rapid_transit: List[str]
    bus: List[str]
    commuter_rail: List[str]
    ferry: List[str]


class StationStop(BaseModel):
    """A station or stop along a route.

    Attributes:
        stop_name: Display name of the station.
        branches: Branch identifiers (used for Green Line), or `None`.
        station: Station identifier (e.g., `place-alfcl`).
        order: Position in route order (0-indexed).
        stops: Map of direction ID to list of stop IDs.
        accessible: Whether the station is ADA accessible.
        pedal_park: Whether the station has bike parking.
        enclosed_bike_parking: Whether the station has enclosed bike storage.
        terminus: Whether this is a terminal station.
        disabled: Whether this stop is currently disabled.
        short: Short display name.
    """

    model_config = ConfigDict(extra="allow")
    stop_name: str
    branches: List[str] | None
    station: str
    order: int
    stops: Dict[str, List[str]]
    accessible: bool | None = None
    pedal_park: bool | None = None
    enclosed_bike_parking: bool | None = None
    terminus: bool | None = None
    disabled: bool | None = None
    short: str | None = None


class StopsResponse(BaseModel):
    """Response for `/api/stops/{route_id}` — station/stop info for a route.

    Attributes:
        type: Route type (e.g., `rapid_transit`, `bus`, `commuter_rail`).
        direction: Map of direction ID to direction name (e.g., `{"0": "Southbound"}`).
        stations: Ordered list of stations/stops along the route.
        service_start: Service start date, if applicable.
        service_end: Service end date, if applicable.
    """

    model_config = ConfigDict(extra="allow")
    type: str
    direction: Dict[str, str]
    stations: List[StationStop]
    service_start: str | None = None
    service_end: str | None = None

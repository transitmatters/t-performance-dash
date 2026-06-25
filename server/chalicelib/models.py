"""Pydantic models for API request parameters and response schemas.

All models use Pydantic v2 and serve as both runtime validation
and API documentation via `chalice-spec`.
"""

from datetime import date
from typing import List, Dict, Union, Any
from pydantic import BaseModel, ConfigDict, Field

#################################################
# API Request Parameter Models
#################################################


_STOP_ID_DESC = (
    "MBTA stop ID. "
    "Rapid transit: 5-digit numeric (e.g. `70061`). "
    "Bus: `{route}-{direction}-{n}` (e.g. `1-0-110`). "
    "Commuter rail: `{route}_{direction}_{stop_code}` (e.g. `CR-Fairmount_0_DB-2205-01`). "
    "Use `/api/stops/{route_id}` to look up valid stop IDs for a route."
)

_ROUTE_ID_DESC = (
    "MBTA route ID. "
    "Rapid transit: `Red`, `Orange`, `Blue`, `Green-B`-`Green-E`, `Mattapan`. "
    "Bus: numeric string (e.g. `1`, `66`). "
    "Commuter rail: `CR-{line}` (e.g. `CR-Fairmount`). "
    "Ferry: `Boat-F1`, `Boat-F4`, etc. "
    "Use `/api/routes` to list all valid route IDs."
)

_LINE_ID_DESC = (
    "GTFS line identifier. "
    "Rapid transit: `line-red`, `line-orange`, `line-blue`, `line-green`, `line-mattapan`. "
    "Commuter rail: `line-Fairmount`, `line-Lowell`, etc. "
    "Use `/api/routes` to list all valid values."
)

_DATE_RANGE_START_DESC = "Start of the date range, inclusive (YYYY-MM-DD)."
_DATE_RANGE_END_DESC = "End of the date range, inclusive (YYYY-MM-DD)."


class HeadwayParams(BaseModel):
    """Query parameters for `/api/headways/{user_date}`.

    Attributes:
        stop: One or more stop IDs to retrieve headway data for.
    """

    stop: List[str] = Field(default=[], description=_STOP_ID_DESC)


class DwellParams(BaseModel):
    """Query parameters for `/api/dwells/{user_date}`.

    Attributes:
        stop: One or more stop IDs to retrieve dwell data for.
    """

    stop: List[str] = Field(default=[], description=_STOP_ID_DESC)


class TravelTimeParams(BaseModel):
    """Query parameters for `/api/traveltimes/{user_date}`.

    Attributes:
        from_stop: One or more origin stop IDs.
        to_stop: One or more destination stop IDs.
    """

    from_stop: List[str] = Field(default=[], description=f"Origin {_STOP_ID_DESC}")
    to_stop: List[str] = Field(default=[], description=f"Destination {_STOP_ID_DESC}")


class AlertsByDateParams(BaseModel):
    """Query parameters for `/api/alerts/{user_date}`.

    Attributes:
        route: One or more route IDs to filter alerts by.
    """

    route: List[str] = Field(default=[], description=_ROUTE_ID_DESC)


class AggregateTravelTimesParams(BaseModel):
    """Query parameters for `/api/aggregate/traveltimes` and `/api/aggregate/traveltimes2`.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        from_stop: One or more origin stop IDs.
        to_stop: One or more destination stop IDs.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    from_stop: List[str] = Field(default=[], description=f"Origin {_STOP_ID_DESC}")
    to_stop: List[str] = Field(default=[], description=f"Destination {_STOP_ID_DESC}")


class AggregateHeadwaysParams(BaseModel):
    """Query parameters for `/api/aggregate/headways`.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        stop: One or more stop IDs.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    stop: List[str] = Field(default=[], description=_STOP_ID_DESC)


class AggregateDwellsParams(BaseModel):
    """Query parameters for `/api/aggregate/dwells`.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        stop: One or more stop IDs.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    stop: List[str] = Field(default=[], description=_STOP_ID_DESC)


_AGG_DESC = "Aggregation period: `daily`, `weekly`, or `monthly`."


class AlertDelaysByLineParams(BaseModel):
    """Parameters for the `/api/linedelays` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        line: Line identifier (e.g., `Red`, `Orange`, `Green-B`).
        agg: Aggregation level — `daily` or `weekly`. Defaults to `weekly`.
    """

    start_date: Union[str, date] = Field(description=_DATE_RANGE_START_DESC)
    end_date: Union[str, date] = Field(description=_DATE_RANGE_END_DESC)
    line: str = Field(
        description=(
            "MBTA line identifier. "
            "Rapid transit: `Red`, `Orange`, `Blue`, `Green-B`-`Green-E`, `Mattapan`. "
            "Commuter rail: `CR-Fairmount`, `CR-Lowell`, etc."
        )
    )
    agg: str = Field(default="weekly", description="Aggregation period: `daily` or `weekly`.")


class TripMetricsByLineParams(BaseModel):
    """Parameters for the `/api/tripmetrics` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
        line: GTFS line identifier (e.g., `line-red`, `line-green`).
    """

    start_date: Union[str, date] = Field(description=_DATE_RANGE_START_DESC)
    end_date: Union[str, date] = Field(description=_DATE_RANGE_END_DESC)
    agg: str = Field(description=_AGG_DESC)
    line: str = Field(description=_LINE_ID_DESC)


class ScheduledServiceParams(BaseModel):
    """Parameters for the `/api/scheduledservice` endpoint.

    Attributes:
        start_date: Start of date range.
        end_date: End of date range.
        route_id: Optional route filter. `None` returns all routes.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    route_id: str | None = Field(default=None, description=_ROUTE_ID_DESC + " Omit to return all routes.")
    agg: str = Field(description=_AGG_DESC)


class RidershipParams(BaseModel):
    """Parameters for the `/api/ridership` endpoint.

    Attributes:
        start_date: Start of date range.
        end_date: End of date range.
        line_id: Optional line filter. `None` returns all lines.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    line_id: str | None = Field(
        default=None,
        description=(
            "Line identifier for ridership data. "
            "Rapid transit: `line-Red`, `line-Orange`, `line-Blue`, `line-Green`. "
            "Bus: `line-{route}` (e.g. `line-1`, `line-66`). "
            "Commuter rail: `line-{line}` (e.g. `line-Fairmount`). "
            "Ferry: `line-F1`, `line-F4`, etc. "
            "Omit to return all lines."
        ),
    )


class TimePredictionParams(BaseModel):
    """Parameters for the `/api/time_predictions` endpoint.

    Attributes:
        route_id: Route identifier (e.g., `Red`, `CR-Fairmount`).
    """

    route_id: str = Field(description=_ROUTE_ID_DESC)


class SpeedRestrictionsParams(BaseModel):
    """Parameters for the `/api/speed_restrictions` endpoint.

    Attributes:
        line_id: GTFS line identifier (e.g., `line-red`, `line-orange`).
        date: Date to query (YYYY-MM-DD).
    """

    line_id: str = Field(
        description=(
            "GTFS rapid transit line identifier: `line-red`, `line-orange`, `line-blue`, or `line-green`. "
            "Speed restriction data is only available for rapid transit lines."
        )
    )
    date: str = Field(description="Date to query (YYYY-MM-DD).")


class ServiceHoursParams(BaseModel):
    """Parameters for the `/api/service_hours` endpoint.

    Attributes:
        line_id: Optional line filter. `None` returns all lines.
        start_date: Start of date range.
        end_date: End of date range.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    line_id: str | None = Field(
        default=None,
        description=_LINE_ID_DESC + " Omit to aggregate all lines.",
    )
    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    agg: str = Field(description=_AGG_DESC)


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

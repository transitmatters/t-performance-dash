"""Pydantic models for API request parameters and response schemas.

All models use Pydantic v2 and serve as both runtime validation
and API documentation via `chalice-spec`.
"""

import datetime
from datetime import date
from typing import List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field, RootModel

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
    "GTFS rapid transit line identifier: `line-red`, `line-orange`, `line-blue`, `line-green`, or `line-mattapan`."
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
AggregationPeriod = Literal["daily", "weekly", "monthly"]


class AlertDelaysByLineParams(BaseModel):
    """Parameters for the `/api/linedelays` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        line: Line identifier (e.g., `Red`, `Orange`, `Green-B`).
        agg: Aggregation level — `daily` or `weekly`. Defaults to `weekly`.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    line: str = Field(
        description=(
            "MBTA line identifier. "
            "Rapid transit: `Red`, `Orange`, `Blue`, `Green-B`-`Green-E`, `Mattapan`. "
            "Commuter rail: `CR-Fairmount`, `CR-Lowell`, etc."
        )
    )
    agg: Literal["daily", "weekly"] = Field(default="weekly", description="Aggregation period: `daily` or `weekly`.")


class ShutdownsParams(BaseModel):
    """Parameters for the `/api/shutdowns` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        line: Line identifier (e.g., `Red`, `Green`, `Green-B`, `CR-Worcester`).
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    line: str = Field(
        description=(
            "MBTA line identifier. "
            "Rapid transit: `Red`, `Orange`, `Blue`, `Green` (every branch), `Green-B`-`Green-E`, `Mattapan`. "
            "Commuter rail: `CR-Fairmount`, `CR-Lowell`, etc."
        )
    )


class TripMetricsByLineParams(BaseModel):
    """Parameters for the `/api/tripmetrics` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
        line: GTFS line identifier (e.g., `line-red`, `line-green`).
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    agg: AggregationPeriod = Field(description=_AGG_DESC)
    line: str = Field(description=_LINE_ID_DESC)


class ScheduledServiceParams(BaseModel):
    """Parameters for the `/api/scheduledservice` endpoint.

    Attributes:
        start_date: Start of date range.
        end_date: End of date range.
        route_id: Route identifier (e.g., `Red`, `1`, `CR-Fairmount`).
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    route_id: str = Field(description=_ROUTE_ID_DESC)
    agg: AggregationPeriod = Field(description=_AGG_DESC)


class RidershipParams(BaseModel):
    """Parameters for the `/api/ridership` endpoint.

    Attributes:
        start_date: Start of date range.
        end_date: End of date range.
        line_id: Line identifier (e.g., `line-Red`, `line-1`, `line-Fairmount`).
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    line_id: str = Field(
        description=(
            "Line identifier for ridership data. "
            "Rapid transit: `line-Red`, `line-Orange`, `line-Blue`, `line-Green`. "
            "Bus: `line-{route}` (e.g. `line-1`, `line-66`). "
            "Commuter rail: `line-{line}` (e.g. `line-Fairmount`). "
            "Ferry: `line-F1`, `line-F4`, etc."
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
        line_id: GTFS line identifier (e.g., `line-Red`, `line-Orange`).
        date: Date to query (YYYY-MM-DD).
    """

    line_id: str = Field(
        description=(
            "GTFS rapid transit line identifier: `line-Red`, `line-Orange`, `line-Blue`, or `line-Green`. "
            "IDs are case-sensitive. Speed restriction data is only available for rapid transit lines."
        )
    )
    # Annotated as datetime.date because a field named `date` can't use the bare `date` type
    date: datetime.date = Field(description="Date to query (YYYY-MM-DD).")


class ServiceHoursParams(BaseModel):
    """Parameters for the `/api/service_hours` endpoint.

    Attributes:
        line_id: GTFS line identifier (e.g., `line-red`).
        start_date: Start of date range.
        end_date: End of date range.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    line_id: str = Field(description=_LINE_ID_DESC)
    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    agg: AggregationPeriod = Field(description=_AGG_DESC)


class BusTripMetricsParams(BaseModel):
    """Parameters for the `/api/bustripmetrics` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        route: Bus route ID, or a comma-separated group of routes.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`. Defaults to `daily`.
        time_band: Optional time of day to report instead of the whole day.
        day_type: Optional day type to keep, dropping every other day.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    route: str = Field(
        description=(
            "Bus route ID (e.g. `1`, `57`, `111`), or a comma-separated list (e.g. `114,116,117`) "
            "whose routes are summed per period."
        )
    )
    agg: AggregationPeriod = Field(default="daily", description=_AGG_DESC)
    time_band: Literal["early_am", "am_peak", "midday", "pm_peak", "evening", "late_night"] | None = Field(
        default=None,
        description=(
            "Time of day. Each figure is then that band's alone, and daily entries drop `median_speed_mph` "
            "and `mean_speed_mph`, which have no per-band version. Omit it for the whole day."
        ),
    )
    day_type: Literal["business_day", "weekend_or_holiday"] | None = Field(
        default=None,
        description="Keep only business days, or only weekends and MBTA holidays. Omit it for every day.",
    )


class CrTripMetricsParams(BaseModel):
    """Parameters for the `/api/crtripmetrics` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        route: Commuter Rail route ID, or `all` for the whole system.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`. Defaults to `daily`.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    route: str = Field(description="Commuter Rail route ID (e.g. `CR-Fairmount`), or `all` for the whole system.")
    agg: AggregationPeriod = Field(default="daily", description=_AGG_DESC)


class BusSpeedLeaderboardParams(BaseModel):
    """Parameters for the `/api/busspeedleaderboard` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        limit: Maximum number of routes to return.
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    limit: int = Field(default=10, description="Maximum number of routes to return. Clamped to 1-200.")


class ReliabilityParams(BaseModel):
    """Parameters for the `/api/reliability` endpoint.

    Attributes:
        route_id: `RIDE`, a commuter rail route, or `commuter-rail` for all of commuter rail.
        start_date: Start of date range.
        end_date: End of date range.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`.
    """

    route_id: str = Field(
        description=(
            "`RIDE` for The RIDE, a commuter rail route ID (e.g. `CR-Worcester`), "
            "or `commuter-rail` for every commuter rail route combined."
        )
    )
    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    agg: AggregationPeriod = Field(description=_AGG_DESC)


class CrScorecardParams(BaseModel):
    """Parameters for the `/api/crscorecard` endpoint.

    Attributes:
        route_id: A Commuter Rail route, or `commuter-rail` to compare every route.
        start_date: Start of date range.
        end_date: End of date range.
        agg: Aggregation level — `daily`, `weekly`, or `monthly`. Ignored for `commuter-rail`.
        day_kind: Which schedule to measure, or `all` for every day.
    """

    route_id: str = Field(
        description=(
            "Commuter Rail route ID (e.g. `CR-Worcester`), or `commuter-rail` for one summary per route "
            "over the whole range."
        )
    )
    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)
    agg: AggregationPeriod = Field(description=f"{_AGG_DESC} Ignored for `commuter-rail`.")
    day_kind: Literal["weekday", "saturday", "sunday", "all"] = Field(
        description="Which schedule to measure: `weekday`, `saturday` or `sunday`, or `all` to mix every day."
    )


class WeatherParams(BaseModel):
    """Parameters for the `/api/weather` endpoint.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
    """

    start_date: date = Field(description=_DATE_RANGE_START_DESC)
    end_date: date = Field(description=_DATE_RANGE_END_DESC)


#################################################
# API Response Models
#################################################
#
# These describe what the production (aws) backend sends; tests/test_api_models.py validates them
# against captured production responses in tests/fixtures/api_samples/.
#
# - Endpoints that return a bare JSON array use a RootModel.
# - Object models allow extra keys, so adding a field doesn't break clients generated from the spec.
# - Fields that are missing or null on any code path are optional and nullable.
# - `int` is only used where the backend always emits integers; computed values are `float`.
# - Closed sets of response values (peak periods, alert types, ...) are documented rather than
#   enumerated, so a new value doesn't break clients with exhaustive enums.


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
class FacilityProperty(BaseModel):
    """A name/value property of an MBTA facility.

    Attributes:
        name: Property name (e.g. `direction`, `capacity`, `excludes-stop`).
        value: Property value. Numeric values are sent as strings (e.g. `"20"`).
    """

    model_config = ConfigDict(extra="allow")
    name: str
    value: str | None = None


class FacilityAttributes(BaseModel):
    """Attributes of an MBTA facility, passed through from the MBTA v3 API.

    Attributes:
        type: Facility type (e.g. `ELEVATOR`, `ESCALATOR`, `BIKE_STORAGE`, `PARKING_AREA`).
        long_name: Full display name.
        short_name: Short display name.
        latitude: Latitude as a decimal string (e.g. `"42.352271"`), or `null`.
        longitude: Longitude as a decimal string, or `null`.
        properties: Additional facility properties.
    """

    model_config = ConfigDict(extra="allow")
    type: str
    long_name: str | None = None
    short_name: str | None = None
    latitude: str | None = None
    longitude: str | None = None
    properties: List[FacilityProperty] | None = None


class JsonApiResourceIdentifier(BaseModel):
    """A JSON:API reference to another resource.

    Attributes:
        id: Resource ID (e.g. `place-alfcl`).
        type: Resource type (e.g. `stop`).
    """

    model_config = ConfigDict(extra="allow")
    id: str
    type: str


class FacilityStopRelationship(BaseModel):
    """The stop a facility belongs to.

    Attributes:
        data: Reference to the stop.
    """

    model_config = ConfigDict(extra="allow")
    data: JsonApiResourceIdentifier | None = None


class FacilityRelationships(BaseModel):
    """Relationships of an MBTA facility.

    Attributes:
        stop: The stop the facility belongs to.
    """

    model_config = ConfigDict(extra="allow")
    stop: FacilityStopRelationship | None = None


class Facility(BaseModel):
    """An MBTA facility (elevator, escalator, parking, etc.) from the MBTA v3 API.

    Attributes:
        id: Facility identifier.
        type: JSON:API resource type, always `facility`.
        attributes: Facility attributes.
        relationships: Related resources.
        links: JSON:API links.
    """

    model_config = ConfigDict(extra="allow")
    id: str
    type: str
    attributes: FacilityAttributes
    relationships: FacilityRelationships | None = None
    links: Dict[str, str | None] | None = None


class JsonApiVersion(BaseModel):
    """JSON:API version information.

    Attributes:
        version: JSON:API version (e.g. `1.0`).
    """

    model_config = ConfigDict(extra="allow")
    version: str | None = None


class FacilitiesResponse(BaseModel):
    """Response for `/api/facilities`: the MBTA v3 `/facilities` JSON:API document, passed through.

    Keys are sorted, and every JSON number in the MBTA response is sent as a string.

    Attributes:
        data: Matching facilities.
        jsonapi: JSON:API version information.
        links: JSON:API links.
    """

    model_config = ConfigDict(extra="allow")
    data: List[Facility]
    jsonapi: JsonApiVersion | None = None
    links: Dict[str, str | None] | None = None


# Alerts
class Alert(BaseModel):
    """An archived service alert's validity window.

    Attributes:
        valid_from: Start time. Dates up to 2024-04-12 use `YYYY-MM-DDTHH:MM:SS` in Eastern time with no
            offset; later dates use ISO 8601 with an offset (e.g. `2026-10-07T08:31:00-04:00`).
        valid_to: End time in the same format, or `null` for open-ended alerts.
        text: Alert header text.
    """

    model_config = ConfigDict(extra="allow")
    valid_from: str
    valid_to: str | None = None
    text: str | None = None


class AlertsRouteResponse(RootModel[List[Alert] | None]):
    """Response for `/api/alerts/{user_date}`: archived alerts in effect on that day.

    `null` (with HTTP 200) for dates before 2017-11-06, or when the day's archive can't be read.
    """


class AlertActivePeriod(BaseModel):
    """A period during which a live alert is active.

    Attributes:
        start: Start time, ISO 8601 with offset.
        end: End time, ISO 8601 with offset, or `null` if open-ended.
        current: Whether the period includes the current time.
        upcoming: Whether the period has not started yet, or is open-ended.
    """

    model_config = ConfigDict(extra="allow")
    start: str | None = None
    end: str | None = None
    current: bool
    upcoming: bool


class LiveAlert(BaseModel):
    """A current MBTA service alert, reformatted by the dashboard.

    Which fields are set depends on `type`:
    - `DELAY`, `DETOUR`: `stops` holds numeric rapid transit stop IDs as integers, and `routes` is set.
    - `SHUTTLE`, `SUSPENSION`, `STOP_CLOSURE`: `stops` holds non-numeric stop IDs (e.g. `place-dwnxg`).
    - `ELEVATOR_CLOSURE`, `ESCALATOR_CLOSURE`: `stops` holds non-numeric stop IDs, and `description` is set.

    Attributes:
        id: MBTA alert ID.
        type: MBTA alert effect (see above).
        header: Alert header text.
        active_period: Periods during which the alert is active.
        stops: Affected stop IDs, unordered. Integers for `DELAY` and `DETOUR`, strings otherwise.
        routes: Affected route IDs, possibly repeated (`DELAY` and `DETOUR` only).
        description: Long-form description (elevator and escalator closures only).
    """

    model_config = ConfigDict(extra="allow")
    id: str
    type: str
    header: str
    active_period: List[AlertActivePeriod]
    stops: List[str | int]
    routes: List[str] | None = None
    description: str | None = None


class LiveAlertsResponse(RootModel[List[LiveAlert]]):
    """Response for `/api/alerts`: current MBTA alerts with one of the effects listed on `LiveAlert`."""


# Performance Data
class HeadwayEvent(BaseModel):
    """The time between two consecutive departures from the requested stop(s).

    Times are local (Eastern) wall-clock times formatted as `YYYY-MM-DDTHH:MM:SS`, with no offset.

    Attributes:
        route_id: Route of the departing trip (e.g. `Red`, `28`, `CR-Fairmount`).
        direction: Direction ID as a string (`"0"` or `"1"`). Dwells and travel times use integers.
        current_dep_dt: Departure time.
        headway_time_sec: Seconds since the previous departure.
        benchmark_headway_time_sec: Scheduled headway in seconds, or `null` when unavailable.
        vehicle_consist: Car numbers separated by `|` (e.g. `1850|1851`), or `null` when unavailable.
        occupancy_status: GTFS-RT occupancy status of each car, separated by `|` in `vehicle_consist` order
            (e.g. `MANY_SEATS_AVAILABLE|STANDING_ROOM_ONLY`). A car without a reading is `NO_DATA_AVAILABLE`.
            `null` when no car reported, which covers everything but Red and Orange Line cars with sensors and
            any day before 2026-10-22. Read on arrival at the next stop, so it shows how full the train left this one.
        occupancy_percentage: Occupancy percentage of each car, separated by `|` in the same order, with an
            empty slot for a car without a reading (e.g. `6.0||4.0`), or `null` when no car reported.
        vehicle_label: Vehicle label; may be empty.
    """

    model_config = ConfigDict(extra="allow")
    route_id: str
    direction: str
    current_dep_dt: str
    headway_time_sec: float
    benchmark_headway_time_sec: float | None = None
    vehicle_consist: str | None = None
    occupancy_status: str | None = None
    occupancy_percentage: str | None = None
    vehicle_label: str


class HeadwayResponse(RootModel[List[HeadwayEvent]]):
    """Response for `/api/headways/{user_date}`: headways for one service day, in departure order."""


class DwellEvent(BaseModel):
    """The time a vehicle spent stopped at the requested stop(s).

    Times are local (Eastern) wall-clock times formatted as `YYYY-MM-DDTHH:MM:SS`, with no offset.

    Attributes:
        route_id: Route of the trip (e.g. `Red`, `1`, `CR-Fairmount`).
        direction: Direction ID (`0` or `1`).
        arr_dt: Arrival time.
        dep_dt: Departure time.
        dwell_time_sec: Seconds between arrival and departure.
        vehicle_consist: Car numbers separated by `|`, or `null` when unavailable.
        occupancy_status: GTFS-RT occupancy status of each car, separated by `|` in `vehicle_consist` order
            (e.g. `MANY_SEATS_AVAILABLE|STANDING_ROOM_ONLY`). A car without a reading is `NO_DATA_AVAILABLE`.
            `null` when no car reported, which covers everything but Red and Orange Line cars with sensors and
            any day before 2026-10-22. Read on arrival at the next stop, so it shows how full the train left this one.
        occupancy_percentage: Occupancy percentage of each car, separated by `|` in the same order, with an
            empty slot for a car without a reading (e.g. `6.0||4.0`), or `null` when no car reported.
        vehicle_label: Vehicle label; may be empty.
    """

    model_config = ConfigDict(extra="allow")
    route_id: str
    direction: int
    arr_dt: str
    dep_dt: str
    dwell_time_sec: float
    vehicle_consist: str | None = None
    occupancy_status: str | None = None
    occupancy_percentage: str | None = None
    vehicle_label: str


class DwellResponse(RootModel[List[DwellEvent]]):
    """Response for `/api/dwells/{user_date}`: dwells for one service day, in time order."""


class TravelTimeEvent(BaseModel):
    """A trip's travel time between the requested origin and destination stops.

    Times are local (Eastern) wall-clock times formatted as `YYYY-MM-DDTHH:MM:SS`, with no offset.

    Attributes:
        route_id: Route of the trip (e.g. `Red`, `28`, `CR-Fairmount`).
        direction: Direction ID (`0` or `1`).
        dep_dt: Departure time from the origin.
        arr_dt: Arrival time at the destination.
        travel_time_sec: Travel time in seconds.
        benchmark_travel_time_sec: Scheduled travel time in seconds, or `null` when unavailable.
        tm_benchmark_travel_time_sec: TransitMatters benchmark travel time in seconds for the stop pair
            (the same on every event), or `null` when there is none (bus, commuter rail, ferry).
        vehicle_consist: Car numbers separated by `|`, or `null` when unavailable.
        occupancy_status: GTFS-RT occupancy status of each car, separated by `|` in `vehicle_consist` order
            (e.g. `MANY_SEATS_AVAILABLE|STANDING_ROOM_ONLY`). A car without a reading is `NO_DATA_AVAILABLE`.
            `null` when no car reported, which covers everything but Red and Orange Line cars with sensors and
            any day before 2026-10-22. Read on arrival at the next stop, so it shows how full the train left this one.
        occupancy_percentage: Occupancy percentage of each car, separated by `|` in the same order, with an
            empty slot for a car without a reading (e.g. `6.0||4.0`), or `null` when no car reported.
        vehicle_label: Vehicle label; may be empty.
    """

    model_config = ConfigDict(extra="allow")
    route_id: str
    direction: int
    dep_dt: str
    arr_dt: str
    travel_time_sec: float
    benchmark_travel_time_sec: float | None = None
    tm_benchmark_travel_time_sec: float | None = None
    vehicle_consist: str | None = None
    occupancy_status: str | None = None
    occupancy_percentage: str | None = None
    vehicle_label: str


class TravelTimeResponse(RootModel[List[TravelTimeEvent]]):
    """Response for `/api/traveltimes/{user_date}`: travel times for one service day, in departure order."""


# Aggregated Data
# Field descriptions (rather than docstring attributes) are used here so that subclasses' schemas
# carry the inherited fields' documentation.
class AggregateStats(BaseModel):
    """Summary statistics, in seconds, over a group of events.

    Groups with 4 or fewer events are left out of aggregate responses.
    """

    model_config = ConfigDict(extra="allow", populate_by_name=True)
    count: int = Field(description="Number of events.")
    mean: float = Field(description="Mean, in seconds.")
    min: float = Field(description="Minimum, in seconds.")
    max: float = Field(description="Maximum, in seconds.")
    std: float = Field(description="Population standard deviation, in seconds.")
    sum: float = Field(description="Sum, in seconds.")
    p25: float = Field(alias="25%", description="25th percentile, in seconds.")
    p50: float = Field(alias="50%", description="Median, in seconds.")
    p75: float = Field(alias="75%", description="75th percentile, in seconds.")


class AggregateByDate(AggregateStats):
    """Statistics for one service date and peak period."""

    service_date: str = Field(description="Service date (`YYYY-MM-DD`).")
    peak: str = Field(
        description=(
            "`all` for the whole day. `/api/aggregate/traveltimes2` also has `am_peak`, `pm_peak` and `off_peak` rows."
        )
    )
    holiday: bool = Field(description="Whether the service date is a US federal holiday.")
    weekend: bool = Field(description="Whether the service date is a Saturday or Sunday.")


class HeadwayAggregateByDate(AggregateByDate):
    """Headway statistics for one service date, with bunching and on-time counts."""

    bunched: int = Field(
        description="Number of headways at most half the scheduled headway (0 when there is no schedule)."
    )
    on_time: int = Field(
        description="Number of headways within 25% of the scheduled headway (0 when there is no schedule)."
    )


class AggregateByTime(AggregateStats):
    """Statistics for one 30-minute departure-time bucket across the date range."""

    dep_time_from_epoch: str = Field(
        description=(
            "Bucket start as `1970-01-01THH:MM:SS`. Departures after midnight and before 03:30 use `1970-01-02`."
        )
    )
    is_peak_day: bool = Field(description="`true` for non-holiday weekdays, `false` for weekends and holidays.")


class TravelTimeAggregateResponse(RootModel[List[AggregateByDate]]):
    """Response for `/api/aggregate/traveltimes`: travel time statistics per service date.

    `peak` is always `all`. The static development backend returns the `/api/aggregate/traveltimes2`
    shape instead.
    """


class TravelTimeAggregate2Response(BaseModel):
    """Response for `/api/aggregate/traveltimes2`: travel time statistics by date and by time of day.

    Attributes:
        by_date: Per-date statistics: an `all` row for each date, then a row per peak period.
        by_time: Statistics per 30-minute departure-time bucket, separately for peak and non-peak days.
    """

    model_config = ConfigDict(extra="allow")
    by_date: List[AggregateByDate]
    by_time: List[AggregateByTime]


class HeadwaysAggregateResponse(RootModel[List[HeadwayAggregateByDate]]):
    """Response for `/api/aggregate/headways`: headway statistics per service date (`peak` is `all`)."""


class DwellsAggregateResponse(RootModel[List[AggregateByDate]]):
    """Response for `/api/aggregate/dwells`: dwell time statistics per service date (`peak` is `all`)."""


# Line Metrics
class LineDelayEntry(BaseModel):
    """Alert-reported delay on a line for one day or week, in minutes, by cause.

    Attributes:
        date: Day, or the Monday starting the week (`YYYY-MM-DD`).
        line: Line as requested (e.g. `Red`, `Green-B`, `CR-Fairmount`).
        total_delay_time: Total delay.
        brake_problem: Delay attributed to brake problems.
        car_traffic: Delay attributed to car traffic.
        disabled_vehicle: Delay attributed to disabled vehicles.
        door_problem: Delay attributed to door problems.
        fire: Delay attributed to fires.
        flooding: Delay attributed to flooding.
        mechanical_problem: Delay attributed to mechanical problems.
        medical_emergency: Delay attributed to medical emergencies.
        other: Delay attributed to other causes.
        police_activity: Delay attributed to police activity.
        power_problem: Delay attributed to power problems.
        signal_problem: Delay attributed to signal problems.
        switch_problem: Delay attributed to switch problems.
        track_issue: Delay attributed to track issues.
        track_work: Delay attributed to track work.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    line: str
    total_delay_time: int
    brake_problem: int
    car_traffic: int
    disabled_vehicle: int
    door_problem: int
    fire: int
    flooding: int
    mechanical_problem: int
    medical_emergency: int
    other: int
    police_activity: int
    power_problem: int
    signal_problem: int
    switch_problem: int
    track_issue: int
    track_work: int


class LineDelaysResponse(RootModel[List[LineDelayEntry]]):
    """Response for `/api/linedelays`: alert-based delays per day or week, depending on `agg`."""


class ShutdownPeriod(BaseModel):
    """When a shutdown was in effect.

    Attributes:
        start: Start, as an ISO 8601 timestamp with offset.
        end: End, as an ISO 8601 timestamp with offset. Cut short if the alert was taken down early.
    """

    model_config = ConfigDict(extra="allow")
    start: str
    end: str


class ShutdownEntry(BaseModel):
    """A shuttle, suspension, or station closure alert that ran at least 3 hours.

    Attributes:
        line: Line as requested (e.g. `Red`, `Green`, `CR-Worcester`).
        alert_id: MBTA alert ID.
        effect: Alert effect: `SHUTTLE`, `SUSPENSION`, or `STATION_CLOSURE`.
        cause: Alert cause (e.g. `MAINTENANCE`, `CONSTRUCTION`), if given.
        header: Alert header text.
        stops: Stop and station IDs the alert lists on this line.
        periods: When the shutdown was in effect, in order.
        first_start: Service date of the first period's start (`YYYY-MM-DD`).
        last_end: Service date of the last period's end (`YYYY-MM-DD`).
    """

    model_config = ConfigDict(extra="allow")
    line: str
    alert_id: str
    effect: str
    cause: str | None = None
    header: str
    stops: List[str]
    periods: List[ShutdownPeriod]
    first_start: str
    last_end: str


class ShutdownsResponse(RootModel[List[ShutdownEntry]]):
    """Response for `/api/shutdowns`: shutdowns overlapping the date range, sorted by start date."""


class TripMetricsEntry(BaseModel):
    """Delivered trip metrics for a line over one day, week or month.

    Entries can also have per-fleet share fields named `fleet_mix_<type>` (e.g. `fleet_mix_red1`,
    `fleet_mix_type7`), which vary by line and are omitted when unknown.

    Attributes:
        date: Day, Monday of the week, or first day of the month (`YYYY-MM-DD`).
        line: Line ID (e.g. `line-red`).
        count: Trips delivered (the median daily count for weekly and monthly data).
        total_time: Total trip time in seconds.
        miles_covered: Total miles covered.
        avg_car_age: Average car age in years, if known.
        pct_new_trips: Percentage of trips run with new cars, if known.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    line: str
    count: float
    total_time: float
    miles_covered: float
    avg_car_age: float | None = None
    pct_new_trips: float | None = None


class TripMetricsResponse(RootModel[List[TripMetricsEntry]]):
    """Response for `/api/tripmetrics`: delivered trip metrics at the requested aggregation level."""


class BusTripMetricsEntry(BaseModel):
    """Delivered trip metrics for a bus route (or group of routes) over one day, week or month.

    Entries can also have fleet fields: `fleet_trips` (trips with a known vehicle), `avg_bus_age`,
    `pct_<type>_trips` and per-propulsion shares named `fleet_mix_<type>` (e.g. `fleet_mix_hybrid`).
    These are omitted when unknown. Daily entries for the whole day (no `time_band`) also have
    `median_speed_mph` and `mean_speed_mph`.

    Attributes:
        date: Day, Monday of the week, or first day of the month (`YYYY-MM-DD`).
        route: Route ID, or the comma-separated group that was requested.
        count: Trips delivered.
        total_time: Total trip time in seconds.
        miles_covered: Total miles covered.
        n_traversals: Segment traversals measured.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    route: str
    count: float
    total_time: float
    miles_covered: float
    n_traversals: float


class BusTripMetricsResponse(RootModel[List[BusTripMetricsEntry]]):
    """Response for `/api/bustripmetrics`: delivered trip metrics at the requested aggregation level."""


class CrTripMetricsEntry(BaseModel):
    """Commuter Rail fleet metrics for a route over one day, week or month.

    Entries also have per-fleet shares named `fleet_mix_<type>` (e.g. `fleet_mix_rotem`), and
    `avg_cab_car_age` when known.

    Attributes:
        date: Day, Monday of the week, or first day of the month (`YYYY-MM-DD`).
        route: Route ID, or `all`.
        fleet_trips: Trips with a known cab car.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    route: str
    fleet_trips: float | None = None


class CrTripMetricsResponse(RootModel[List[CrTripMetricsEntry]]):
    """Response for `/api/crtripmetrics`: Commuter Rail fleet metrics at the requested aggregation level."""


class BusSpeedLeaderboardEntry(BaseModel):
    """A bus route's totals over the date range. Speed in mph is `miles_covered / (total_time / 3600)`.

    Attributes:
        route: Route ID.
        count: Trips delivered.
        total_time: Total trip time in seconds.
        miles_covered: Total miles covered.
        n_traversals: Segment traversals measured.
    """

    model_config = ConfigDict(extra="allow")
    route: str
    count: float
    total_time: float
    miles_covered: float
    n_traversals: float


class BusSpeedLeaderboardResponse(RootModel[List[BusSpeedLeaderboardEntry]]):
    """Response for `/api/busspeedleaderboard`: bus routes ranked by average speed, slowest first."""


class ServiceHoursEntry(BaseModel):
    """Scheduled and delivered service hours for one day, week or month.

    Attributes:
        date: Day, Monday of the week, or last day of the month (`YYYY-MM-DD`).
        scheduled: Scheduled service hours.
        delivered: Delivered service hours.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    scheduled: float
    delivered: float


class ServiceHoursResponse(RootModel[List[ServiceHoursEntry]]):
    """Response for `/api/service_hours`: scheduled vs. delivered service hours."""


# Predictions
class TimePredictionBucket(BaseModel):
    """Prediction accuracy for one week and prediction-horizon bin.

    Attributes:
        weekly: Week start date (`YYYY-MM-DD`).
        mode: Mode (e.g. `subway`, `bus`).
        route_id: Route ID.
        bin: Prediction horizon: `0-3 min`, `3-6 min`, `6-12 min` or `12-30 min`.
        arrival_departure: Prediction type (e.g. `blended`).
        num_predictions: Number of predictions.
        num_accurate_predictions: Number of accurate predictions.
    """

    model_config = ConfigDict(extra="allow")
    weekly: str
    mode: str
    route_id: str
    bin: str
    arrival_departure: str
    num_predictions: int
    num_accurate_predictions: int


class TimePredictionWeek(BaseModel):
    """Prediction accuracy for a route over one week.

    Attributes:
        routeId: Route ID.
        week: Week start date (`YYYY-MM-DD`).
        prediction: Accuracy per prediction-horizon bin.
    """

    model_config = ConfigDict(extra="allow")
    routeId: str
    week: str
    prediction: List[TimePredictionBucket]


class TimePredictionResponse(RootModel[List[TimePredictionWeek]]):
    """Response for `/api/time_predictions`: weekly prediction accuracy, oldest week first."""


# Ridership
class RidershipEntry(BaseModel):
    """Ridership for one week.

    Attributes:
        date: Week start date (`YYYY-MM-DD`).
        count: Ridership count.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    count: int


class RidershipResponse(RootModel[List[RidershipEntry]]):
    """Response for `/api/ridership`: ridership counts over the date range."""


# Reliability
class ReliabilityCounts(BaseModel):
    """On-time and cancellation counts for one commuter rail time period.

    Attributes:
        otpNumerator: Trips that ran on time.
        otpDenominator: Trips measured for on-time performance.
        cancelled: Cancelled trips.
    """

    model_config = ConfigDict(extra="allow")
    otpNumerator: int
    otpDenominator: int
    cancelled: int


class ReliabilityEntry(BaseModel):
    """Summed on-time performance counts for one day, week, or month.

    The RIDE entries have `completed` and `onTime`, plus `requests`, `noShows` and `missed` for periods
    where every day recorded them. Commuter rail entries have `otpNumerator`, `otpDenominator`,
    `cancelled`, `peak` and `offPeak`.

    Attributes:
        date: Day, Monday of the week, or first day of the month (`YYYY-MM-DD`).
        days: Service days with data in the period.
        completed: The RIDE completed trips.
        onTime: The RIDE trips completed on time.
        requests: The RIDE trip requests.
        noShows: The RIDE rider no-shows.
        missed: The RIDE missed trips.
        otpNumerator: Commuter rail trips that ran on time.
        otpDenominator: Commuter rail trips measured.
        cancelled: Commuter rail cancelled trips.
        peak: Commuter rail peak-period counts.
        offPeak: Commuter rail off-peak counts.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    days: int
    completed: int | None = None
    onTime: int | None = None
    requests: int | None = None
    noShows: int | None = None
    missed: int | None = None
    otpNumerator: int | None = None
    otpDenominator: int | None = None
    cancelled: int | None = None
    peak: ReliabilityCounts | None = None
    offPeak: ReliabilityCounts | None = None


class ReliabilityResponse(RootModel[List[ReliabilityEntry]]):
    """Response for `/api/reliability`: on-time performance counts, one entry per period."""


class CrScorecardDirection(BaseModel):
    """Scheduled service in one direction, measured at the Boston terminal. Values are averages over the days.

    Attributes:
        trips: Trains.
        firstTrip: First train, in seconds after midnight.
        lastTrip: Last train, in seconds after midnight.
        maxGapMidday: Longest midday wait, in minutes.
        maxGapEvening: Longest evening wait, in minutes.
        hoursAtTarget: Hours from 5am to 1am with a train at least every 30 minutes.
        clockFaceShare: Share of trains on a repeating hourly pattern (0-1).
        byHour: Trains in each hour of the day, starting at midnight.
    """

    model_config = ConfigDict(extra="allow")
    trips: float | None = None
    firstTrip: float | None = None
    lastTrip: float | None = None
    maxGapMidday: float | None = None
    maxGapEvening: float | None = None
    hoursAtTarget: float | None = None
    clockFaceShare: float | None = None
    byHour: List[float | None] | None = None


class CrScorecardEntry(BaseModel):
    """A Commuter Rail schedule measured against Regional Rail standards, averaged over `days` days.

    For a route, entries are per period and have `date`. For `commuter-rail`, entries are per route
    and have `routeId` instead.

    Attributes:
        date: Day, Monday of the week, or first day of the month (`YYYY-MM-DD`).
        routeId: Route ID.
        days: Days averaged.
        outbound: Outbound service.
        inbound: Inbound service.
        peakTrips: Peak trains, both directions.
        reversePeakTrips: Reverse-peak trains, both directions.
    """

    model_config = ConfigDict(extra="allow")
    date: str | None = None
    routeId: str | None = None
    days: int
    outbound: CrScorecardDirection
    inbound: CrScorecardDirection
    peakTrips: float | None = None
    reversePeakTrips: float | None = None


class CrScorecardResponse(RootModel[List[CrScorecardEntry]]):
    """Response for `/api/crscorecard`: scheduled Commuter Rail service against Regional Rail standards."""


# Weather
class WeatherHourlyEntry(BaseModel):
    """One hour's weather in downtown Boston.

    Attributes:
        timestamp: Local-time ISO hour (America/New_York, no offset), e.g. `2026-04-22T14:00`.
        temperature_f: Air temperature in °F.
        weather_code: WMO weather code from Open-Meteo.
        condition: Coarse label, e.g. `clear`, `cloudy`, `fog`, `rain`, `snow`, `storm` or `unknown`.
        precipitation_in: Precipitation in inches for the hour.
        humidity_pct: Relative humidity at 2m (0-100).
        wind_mph: Wind speed at 10m in mph.
    """

    model_config = ConfigDict(extra="allow")
    timestamp: str
    temperature_f: float | None = None
    weather_code: int | None = None
    condition: str | None = None
    precipitation_in: float | None = None
    humidity_pct: int | None = None
    wind_mph: float | None = None


class WeatherResponse(RootModel[List[WeatherHourlyEntry]]):
    """Response for `/api/weather`: hourly observations sorted by timestamp. Days without data are skipped."""


# Service and Scheduling
class ByHourServiceLevels(BaseModel):
    """Hourly service level breakdown.

    Attributes:
        service_levels: Service count by hour (24 entries, index 0 = midnight).
    """

    service_levels: List[int]


class ByDayKindServiceLevels(BaseModel):
    """Scheduled service for a specific day type (weekday, Saturday, or Sunday).

    Attributes:
        date: Reference date (YYYY-MM-DD).
        service_levels: Scheduled trips by hour (index 0 = midnight); empty if unavailable.
    """

    model_config = ConfigDict(extra="allow")
    date: str
    service_levels: List[int]


class ServiceLevelsByDayKind(BaseModel):
    """Service levels grouped by day type. A day type is `null` when the date range doesn't include one.

    Attributes:
        weekday: Weekday service breakdown.
        saturday: Saturday service breakdown.
        sunday: Sunday service breakdown.
    """

    model_config = ConfigDict(extra="allow")
    weekday: ByDayKindServiceLevels | None = None
    saturday: ByDayKindServiceLevels | None = None
    sunday: ByDayKindServiceLevels | None = None


class ScheduledServiceCount(BaseModel):
    """Scheduled trips for one day, week or month.

    Attributes:
        date: Day, Monday of the week, or last day of the month (`YYYY-MM-DD`).
        count: Scheduled trips (the median daily count for weekly and monthly data).
    """

    model_config = ConfigDict(extra="allow")
    date: str
    count: float


class GetScheduledServiceResponse(BaseModel):
    """Response for `/api/scheduledservice` — scheduled service counts.

    Attributes:
        start_date: Requested start date (`YYYY-MM-DD`).
        end_date: Requested end date (`YYYY-MM-DD`).
        start_date_service_levels: Service levels for the first weekday, Saturday and Sunday in the range.
        end_date_service_levels: Service levels for the last weekday, Saturday and Sunday in the range.
        counts: Scheduled trip counts at the requested aggregation level.
    """

    model_config = ConfigDict(extra="allow")
    start_date: str
    end_date: str
    start_date_service_levels: ServiceLevelsByDayKind
    end_date_service_levels: ServiceLevelsByDayKind
    counts: List[ScheduledServiceCount]


# Speed Restrictions
class SpeedRestrictionZone(BaseModel):
    """A speed restriction in effect on a line.

    Attributes:
        id: Restriction ID.
        date: Date of the data (`YYYY-MM-DD`).
        lineId: Line ID (e.g. `line-Red`).
        description: Location description.
        direction: Track direction (e.g. `NB`, `SB`).
        reason: Reason for the restriction.
        fromStopId: GTFS stop ID where the restriction starts.
        toStopId: GTFS stop ID where the restriction ends, or `null` for a single location.
        reported: Date the restriction was reported (`YYYY-MM-DD`).
        speedMph: Speed limit in miles per hour.
        trackFeet: Length of restricted track in feet.
    """

    model_config = ConfigDict(extra="allow")
    id: str
    date: str
    lineId: str
    description: str
    direction: str
    reason: str
    fromStopId: str | None = None
    toStopId: str | None = None
    reported: str
    speedMph: int
    trackFeet: int


class SpeedRestrictionsResponse(BaseModel):
    """Response for `/api/speed_restrictions` — speed restriction zones.

    Attributes:
        available: Whether speed restriction data exists for this date.
        date: Actual date of the data (may be earlier than the requested date). Omitted when unavailable.
        zones: Speed restrictions in effect. Omitted when unavailable.
    """

    model_config = ConfigDict(extra="allow")
    available: bool
    date: str | None = None
    zones: List[SpeedRestrictionZone] | None = None


# Service/Ridership Dashboard
class DashboardSummary(BaseModel):
    """System-wide or per-mode service and ridership summary.

    Attributes:
        totalRidershipHistory: Weekly median ridership keyed by week start date (`YYYY-MM-DD`).
        totalServiceHistory: Weekly median scheduled trips keyed by week start date.
        totalRidershipPercentage: Currently always 0.
        totalServicePercentage: Currently always 0.
        totalPassengers: Weekly median ridership in the latest week.
        totalTrips: Weekly median scheduled trips in the latest week.
        totalRoutesCancelled: Number of routes with cancelled service.
        totalReducedService: Number of routes with reduced service.
        totalIncreasedService: Number of routes with increased service.
        startDate: First date covered (`YYYY-MM-DD`).
        endDate: Last date covered (`YYYY-MM-DD`).
    """

    model_config = ConfigDict(extra="allow")
    totalRidershipHistory: Dict[str, float] | None = None
    totalServiceHistory: Dict[str, float] | None = None
    totalRidershipPercentage: float
    totalServicePercentage: float
    totalPassengers: float
    totalTrips: float
    totalRoutesCancelled: int
    totalReducedService: int
    totalIncreasedService: int
    startDate: str
    endDate: str


class DashboardServiceDay(BaseModel):
    """Scheduled service on one day type.

    Attributes:
        cancelled: Whether service is cancelled.
        tripsPerHour: Scheduled trips per hour (index 0 = midnight), or `null` when cancelled.
        totalTrips: Total scheduled trips.
    """

    model_config = ConfigDict(extra="allow")
    cancelled: bool
    tripsPerHour: List[float] | None = None
    totalTrips: int


class DashboardServiceRegime(BaseModel):
    """Scheduled service by day type.

    Attributes:
        weekday: Weekday service.
        saturday: Saturday service.
        sunday: Sunday service.
    """

    model_config = ConfigDict(extra="allow")
    weekday: DashboardServiceDay
    saturday: DashboardServiceDay
    sunday: DashboardServiceDay


class DashboardServiceRegimes(BaseModel):
    """A line's scheduled service at different points in time.

    Attributes:
        current: Current service.
        oneYearAgo: Service one year ago.
        baseline: Pre-COVID baseline service.
    """

    model_config = ConfigDict(extra="allow")
    current: DashboardServiceRegime
    oneYearAgo: DashboardServiceRegime
    baseline: DashboardServiceRegime


class DashboardLine(BaseModel):
    """Service and ridership data for one line.

    Attributes:
        id: Line ID (e.g. `line-Red`, `line-1`, `line-Fairmount`, `line-Boat-F1`).
        shortName: Short name; may be empty.
        longName: Long name.
        routeIds: Route IDs on the line.
        startDate: First date covered (`YYYY-MM-DD`).
        lineKind: `red`, `orange`, `blue`, `green`, `silver`, `regional-rail`, `bus` or `boat`.
        ridershipHistory: Weekly median ridership keyed by week start date, or `null` when unavailable.
        serviceHistory: Weekly median scheduled trips keyed by week start date.
        serviceRegimes: Scheduled service now, a year ago, and at the pre-COVID baseline.
    """

    model_config = ConfigDict(extra="allow")
    id: str
    shortName: str
    longName: str
    routeIds: List[str]
    startDate: str
    lineKind: str
    ridershipHistory: Dict[str, float] | None = None
    serviceHistory: Dict[str, float] | None = None
    serviceRegimes: DashboardServiceRegimes


class ServiceRidershipDashboardResponse(BaseModel):
    """Response for `/api/service_ridership_dashboard` — system-wide summary.

    Attributes:
        summaryData: System-wide summary.
        modeData: Summaries keyed by mode: `rapid-transit`, `regional-rail`, `bus`, `boat`.
        lineData: Per-line data keyed by line ID.
    """

    model_config = ConfigDict(extra="allow")
    summaryData: DashboardSummary
    modeData: Dict[str, DashboardSummary]
    lineData: Dict[str, DashboardLine]


# Errors
class ErrorResponse(BaseModel):
    """Error body sent by the API framework when a request is rejected.

    Attributes:
        Code: Error type (e.g., `BadRequestError`, `ForbiddenError`).
        Message: Description of the problem.
    """

    model_config = ConfigDict(extra="allow")
    Code: str
    Message: str


class RouteNotFoundResponse(BaseModel):
    """Error body for `/api/stops/{route_id}` when the route doesn't exist.

    Attributes:
        error: Description of the problem (e.g., `Route 'X' not found`).
    """

    model_config = ConfigDict(extra="allow")
    error: str


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
        rapid_transit: Rapid transit route IDs (e.g., `Red`, `Orange`, `Green`).
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
        order: Position in route order, starting at 1. Usually a whole number, but may be fractional.
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
    branches: List[str] | None = None
    station: str
    order: float
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
        type: Route type: `rapidtransit`, `bus`, `commuter-rail` or `ferry`.
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

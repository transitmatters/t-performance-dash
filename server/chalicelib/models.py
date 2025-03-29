from datetime import date
from typing import List, Dict, Union, Any
from pydantic import BaseModel, ConfigDict

#################################################
# API Request Parameter Models
#################################################


class AlertDelaysByLineParams(BaseModel):
    start_date: Union[str, date]
    end_date: Union[str, date]
    line: str


class TripMetricsByLineParams(BaseModel):
    start_date: Union[str, date]
    end_date: Union[str, date]
    agg: str
    line: str


class ScheduledServiceParams(BaseModel):
    start_date: date
    end_date: date
    route_id: str | None = None
    agg: str


class RidershipParams(BaseModel):
    start_date: date
    end_date: date
    line_id: str | None = None


class SpeedRestrictionsParams(BaseModel):
    line_id: str
    on_date: str


class ServiceHoursParams(BaseModel):
    single_route_id: str | None = None
    start_date: date
    end_date: date
    agg: str


#################################################
# API Response Models
#################################################


# Healthcheck
class HealthcheckResponse(BaseModel):
    status: str
    failed_checks_sum: int | None = None
    failed_checks: Dict[str, str] | None = None


# MBTA Resources
class Facility(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: str
    type: str
    attributes: Dict[str, Any]


class Alert(BaseModel):
    valid_from: str
    valid_to: str
    text: str


class AlertsRouteResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    alerts: List[Dict[str, Any]]


# Performance Data
class HeadwayResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    headways: Dict[str, Any]


class DwellResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    dwells: Dict[str, Any]


class TravelTimeResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    travel_times: Dict[str, Any]


# Aggregated Data
class TravelTimeAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class HeadwaysAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class DwellsAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Line Metrics
class LineDelaysResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class TripMetricsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class ServiceHoursResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Predictions
class TimePredictionResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    predictions: Dict[str, Any]


# Ridership
class RidershipEntry(BaseModel):
    date: str
    count: int


class RidershipResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: List[RidershipEntry]


# Service and Scheduling
class ServiceHoursEntry(BaseModel):
    date: str
    scheduled: int
    delivered: int


class ByHourServiceLevels(BaseModel):
    service_levels: List[int]


class ByDayKindServiceLevels(BaseModel):
    date: str
    service_levels: List[int]


class ServiceLevelsByDayKind(BaseModel):
    weekday: ByDayKindServiceLevels
    saturday: ByDayKindServiceLevels
    sunday: ByDayKindServiceLevels


class GetScheduledServiceResponse(BaseModel):
    start_date_service_levels: ServiceLevelsByDayKind
    end_date_service_levels: ServiceLevelsByDayKind
    counts: Dict[str, int]
    service_hours: Dict[str, float]


# Speed Restrictions
class SpeedRestrictionsResponse(BaseModel):
    available: bool
    date: str | None = None
    zones: Dict | None = None


# Misc Endpoints
class GitIdResponse(BaseModel):
    git_id: str


class APIDocsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    openapi: str
    info: Dict[str, Any]
    paths: Dict[str, Any]
    components: Dict[str, Any]

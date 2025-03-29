from datetime import date
from typing import List, Dict, Union, Any
from pydantic import BaseModel, ConfigDict


# Healthcheck Models
class HealthcheckResponse(BaseModel):
    status: str
    failed_checks_sum: int | None = None
    failed_checks: Dict[str, str] | None = None


# Alerts Models
class Alert(BaseModel):
    valid_from: str
    valid_to: str
    text: str


# Facilities Models
class Facility(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: str
    type: str
    attributes: Dict[str, Any]


# Time Predictions Models
class TimePrediction(BaseModel):
    route_id: str
    predictions: List[Dict[str, Any]]


# Service Hours Models
class ServiceHoursEntry(BaseModel):
    date: str
    scheduled: int
    delivered: int


# Scheduled Service Models
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


# Ridership Models
class RidershipEntry(BaseModel):
    date: str
    count: int


# Speed Restrictions Models
class SpeedRestrictionsResponse(BaseModel):
    available: bool
    date: str | None = None
    zones: Dict | None = None


# Request Models
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


# Headways Models
class HeadwayResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    headways: Dict[str, Any]


# Dwells Models
class DwellResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    dwells: Dict[str, Any]


# Travel Times Models
class TravelTimeResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    travel_times: Dict[str, Any]


# Alerts Route Models
class AlertsRouteResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    alerts: List[Dict[str, Any]]


# Aggregate Models
class TravelTimeAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class HeadwaysAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


class DwellsAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Git ID Model
class GitIdResponse(BaseModel):
    git_id: str


# Delays Model
class LineDelaysResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Trip Metrics Model
class TripMetricsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Ridership Response
class RidershipResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: List[RidershipEntry]


# Service Hours Response
class ServiceHoursResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    data: Dict[str, Any]


# Time Predictions Response
class TimePredictionResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    predictions: Dict[str, Any]


# API Docs Model
class APIDocsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    openapi: str
    info: Dict[str, Any]
    paths: Dict[str, Any]
    components: Dict[str, Any]

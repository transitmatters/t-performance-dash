# Data Models

All models are defined in `server/chalicelib/models.py` using Pydantic v2. They serve as both API documentation (via `chalice-spec`) and runtime validation.

## Request Parameter Models

::: server.chalicelib.models.AlertDelaysByLineParams

::: server.chalicelib.models.TripMetricsByLineParams

::: server.chalicelib.models.ScheduledServiceParams

::: server.chalicelib.models.RidershipParams

::: server.chalicelib.models.SpeedRestrictionsParams

::: server.chalicelib.models.ServiceHoursParams

---

## Response Models

### Healthcheck

::: server.chalicelib.models.HealthcheckResponse

### MBTA Resources

::: server.chalicelib.models.Facility

::: server.chalicelib.models.Alert

::: server.chalicelib.models.AlertsRouteResponse

### Performance Data (Single-Day)

::: server.chalicelib.models.HeadwayResponse

::: server.chalicelib.models.DwellResponse

::: server.chalicelib.models.TravelTimeResponse

### Aggregated Data

::: server.chalicelib.models.TravelTimeAggregateResponse

::: server.chalicelib.models.HeadwaysAggregateResponse

::: server.chalicelib.models.DwellsAggregateResponse

### Line Metrics

::: server.chalicelib.models.LineDelaysResponse

::: server.chalicelib.models.TripMetricsResponse

::: server.chalicelib.models.ServiceHoursResponse

### Predictions

::: server.chalicelib.models.TimePredictionResponse

### Ridership

::: server.chalicelib.models.RidershipEntry

::: server.chalicelib.models.RidershipResponse

### Service and Scheduling

::: server.chalicelib.models.ServiceHoursEntry

::: server.chalicelib.models.ByHourServiceLevels

::: server.chalicelib.models.ByDayKindServiceLevels

::: server.chalicelib.models.ServiceLevelsByDayKind

::: server.chalicelib.models.GetScheduledServiceResponse

### Speed Restrictions

::: server.chalicelib.models.SpeedRestrictionsResponse

### Dashboard

::: server.chalicelib.models.ServiceRidershipDashboardResponse

### Route Manifest

::: server.chalicelib.models.RoutesResponse

::: server.chalicelib.models.StationStop

::: server.chalicelib.models.StopsResponse

### Misc

::: server.chalicelib.models.GitIdResponse

::: server.chalicelib.models.APIDocsResponse

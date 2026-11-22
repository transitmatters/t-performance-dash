import dayjs from 'dayjs';

import { useDelimitatedRoute } from '../../common/utils/router';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { useScheduledService } from '../../common/api/hooks/service';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { getRidershipLineId } from '../../common/utils/ridership';
import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { TODAY_STRING } from '../../common/constants/dates';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { SpeedGraph } from '../speed/charts/SpeedGraph';
import { ServiceGraph } from '../service/ServiceGraph';
import { TotalSlowTime } from '../slowzones/charts/TotalSlowTime';
import { RidershipGraph } from '../ridership/RidershipGraph';
import {
  CHART_CONFIG,
  CHART_FETCH_START,
  WINDOW_START,
  chartWindowStart,
  hasTrips,
  trimTrailingEmpty,
} from './scorecardUtils';
import type { MetricKey } from './types';

export const SubwayMetricChart = ({ metric }: { metric: MetricKey }) => {
  const { line, lineShort } = useDelimitatedRoute();
  const endDate = TODAY_STRING;
  const startDate = CHART_FETCH_START;
  const enabled = Boolean(line);

  const tripMetrics = useDeliveredTripMetrics(
    { start_date: startDate, end_date: endDate, agg: CHART_CONFIG.agg, line },
    enabled
  );
  const predictedService = useScheduledService(
    { start_date: startDate, end_date: endDate, route_id: lineShort, agg: CHART_CONFIG.agg },
    enabled
  );
  // The scorecard's request for the same line, so the page asks for ridership once
  const ridership = useRidershipData(
    {
      line_id: getRidershipLineId(line, undefined, undefined, undefined),
      start_date: WINDOW_START,
      end_date: endDate,
    },
    enabled
  );
  const delayTotals = useSlowzoneDelayTotalData();

  if (metric === 'speed') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    if (!hasTrips(tripMetrics.data))
      return <NoDataNotice isLineMetric message="No trips recorded in the last 60 days." />;
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? endDate;
    return (
      <SpeedGraph
        data={data}
        config={CHART_CONFIG}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        peakLineDashed
      />
    );
  }
  if (metric === 'service') {
    if (!tripMetrics.data || !predictedService.data)
      return <ChartPlaceHolder query={tripMetrics.isError ? tripMetrics : predictedService} />;
    if (!hasTrips(tripMetrics.data))
      return <NoDataNotice isLineMetric message="No trips recorded in the last 60 days." />;
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? endDate;
    return (
      <ServiceGraph
        data={data}
        predictedData={predictedService.data}
        config={CHART_CONFIG}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
      />
    );
  }
  if (metric === 'slowzones') {
    if (!delayTotals.data || !line || !lineShort) return <ChartPlaceHolder query={delayTotals} />;
    if (lineShort === 'Bus' || lineShort === 'Commuter Rail')
      return <ChartPlaceHolder query={delayTotals} />;
    const totals = delayTotals.data.data;
    if (!totals.length) return <NoDataNotice isLineMetric message="No slow zone data available." />;
    const slowEnd = totals.length ? dayjs.utc(totals[totals.length - 1].date) : dayjs.utc(endDate);
    return (
      <TotalSlowTime
        data={totals}
        startDateUTC={slowEnd.subtract(30, 'day')}
        endDateUTC={slowEnd}
        line={line}
        lineShort={lineShort}
        showTitle={false}
      />
    );
  }
  if (!ridership.data) return <ChartPlaceHolder query={ridership} />;
  const ridershipData = ridership.data.filter((point) => point.date >= startDate);
  if (!ridershipData.length)
    return <NoDataNotice isLineMetric message="No ridership counts in the last 60 days." />;
  const ridershipEnd = ridershipData[ridershipData.length - 1]?.date ?? endDate;
  return (
    <RidershipGraph
      data={ridershipData}
      config={CHART_CONFIG}
      startDate={chartWindowStart(ridershipEnd)}
      endDate={ridershipEnd}
    />
  );
};

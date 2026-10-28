import dayjs from 'dayjs';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { useDeliveredTripMetrics } from '../../../common/api/hooks/tripmetrics';
import { useScheduledService } from '../../../common/api/hooks/service';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { useSlowzoneDelayTotalData } from '../../../common/api/hooks/slowzones';
import { TODAY_STRING } from '../../../common/constants/dates';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { SpeedGraph } from '../../speed/charts/SpeedGraph';
import { ServiceGraph } from '../../service/ServiceGraph';
import { TotalSlowTime } from '../../slowzones/charts/TotalSlowTime';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import { CHART_FETCH_START, chartWindowStart, trimTrailingEmpty } from './scorecardUtils';
import type { MetricKey } from './types';

export const SubwayMetricChart = ({ metric }: { metric: MetricKey }) => {
  const { line, lineShort } = useDelimitatedRoute();
  const endDate = TODAY_STRING;
  const startDate = CHART_FETCH_START;
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(line);

  const tripMetrics = useDeliveredTripMetrics(
    { start_date: startDate, end_date: endDate, agg: config.agg, line },
    enabled
  );
  const predictedService = useScheduledService(
    { start_date: startDate, end_date: endDate, route_id: lineShort, agg: config.agg },
    enabled
  );
  const ridership = useRidershipData(
    {
      line_id: getRidershipLineId(line, undefined, undefined, undefined),
      start_date: startDate,
      end_date: endDate,
    },
    enabled
  );
  const delayTotals = useSlowzoneDelayTotalData();

  if (metric === 'speed') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? endDate;
    return (
      <SpeedGraph
        data={data}
        config={config}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        peakLineDashed
      />
    );
  }
  if (metric === 'service') {
    if (!tripMetrics.data || !predictedService.data)
      return <ChartPlaceHolder query={tripMetrics.isError ? tripMetrics : predictedService} />;
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? endDate;
    return (
      <ServiceGraph
        data={data}
        predictedData={predictedService.data}
        config={config}
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
  const ridershipEnd = ridership.data[ridership.data.length - 1]?.date ?? endDate;
  return (
    <RidershipGraph
      data={ridership.data}
      config={config}
      startDate={chartWindowStart(ridershipEnd)}
      endDate={ridershipEnd}
    />
  );
};

import React from 'react';
import dayjs from 'dayjs';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../common/components/ui/card';
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
import type { MetricKey } from './types';

interface MetricChartCardProps {
  metric: MetricKey;
}

const METRIC_COPY: Record<MetricKey, { title: string; subtitle: string }> = {
  speed: { title: 'Speed', subtitle: 'Daily average, last 30 days' },
  service: { title: 'Service delivered', subtitle: 'Daily round trips, last 30 days' },
  slowzones: { title: 'Slow zones', subtitle: 'Time lost to slow zones, last 30 days' },
  ridership: { title: 'Ridership', subtitle: 'Fare validations, last 30 days' },
};

/** The single chart the scorecard drives — clicking a row swaps which metric renders here. */
export const MetricChartCard: React.FC<MetricChartCardProps> = ({ metric }) => {
  const { line, lineShort } = useDelimitatedRoute();
  const endDate = TODAY_STRING;
  const startDate = dayjs(endDate).subtract(60, 'day').format('YYYY-MM-DD');
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(line);

  const windowStart = (lastDate: string) =>
    dayjs(lastDate).subtract(30, 'day').format('YYYY-MM-DD');

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

  const { title, subtitle } = METRIC_COPY[metric];

  const renderChart = () => {
    if (metric === 'speed') {
      if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
      // Trim trailing days with no data (the feed lags a couple days) so the chart doesn't end in a
      // grey "No data" slab; clip the axis to the last reported day.
      const lastIdx = tripMetrics.data.map((p) => !!p.miles_covered).lastIndexOf(true);
      const data = lastIdx >= 0 ? tripMetrics.data.slice(0, lastIdx + 1) : tripMetrics.data;
      const chartEnd = data[data.length - 1]?.date ?? endDate;
      return (
        <SpeedGraph
          data={data}
          config={config}
          startDate={windowStart(chartEnd)}
          endDate={chartEnd}
          peakLineDashed
        />
      );
    }
    if (metric === 'service') {
      if (!tripMetrics.data || !predictedService.data)
        return <ChartPlaceHolder query={tripMetrics.isError ? tripMetrics : predictedService} />;
      const lastIdx = tripMetrics.data.map((p) => !!p.miles_covered).lastIndexOf(true);
      const data = lastIdx >= 0 ? tripMetrics.data.slice(0, lastIdx + 1) : tripMetrics.data;
      const chartEnd = data[data.length - 1]?.date ?? endDate;
      return (
        <ServiceGraph
          data={data}
          predictedData={predictedService.data}
          config={config}
          startDate={windowStart(chartEnd)}
          endDate={chartEnd}
        />
      );
    }
    if (metric === 'slowzones') {
      if (!delayTotals.data || !line || !lineShort) return <ChartPlaceHolder query={delayTotals} />;
      if (lineShort === 'Bus' || lineShort === 'Commuter Rail') return <ChartPlaceHolder query={delayTotals} />;
      const totals = delayTotals.data.data;
      const slowEnd = totals.length
        ? dayjs.utc(totals[totals.length - 1].date)
        : dayjs.utc(endDate);
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
        startDate={windowStart(ridershipEnd)}
        endDate={ridershipEnd}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
};

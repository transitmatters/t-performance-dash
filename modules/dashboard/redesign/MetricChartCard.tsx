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
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../../common/constants/dates';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { SpeedGraph } from '../../speed/charts/SpeedGraph';
import { ServiceGraph } from '../../service/ServiceGraph';
import { TotalSlowTime } from '../../slowzones/charts/TotalSlowTime';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import type { LineShort } from '../../../common/types/lines';
import type { MetricKey } from './types';

interface MetricChartCardProps {
  metric: MetricKey;
}

const METRIC_COPY: Record<MetricKey, { title: string; subtitle: string }> = {
  speed: { title: 'Speed', subtitle: 'Daily average, past month' },
  service: { title: 'Service delivered', subtitle: 'Daily round trips, past month' },
  slowzones: { title: 'Slow zones', subtitle: 'Time lost to slow zones, past month' },
  ridership: { title: 'Ridership', subtitle: 'Fare validations, past month' },
};

/** The single chart the scorecard drives — clicking a row swaps which metric renders here. */
export const MetricChartCard: React.FC<MetricChartCardProps> = ({ metric }) => {
  const { line, lineShort } = useDelimitatedRoute();
  const { startDate } = OVERVIEW_OPTIONS.month;
  const endDate = TODAY_STRING;
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

  const { title, subtitle } = METRIC_COPY[metric];

  const renderChart = () => {
    if (metric === 'speed') {
      if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
      return (
        <SpeedGraph
          data={tripMetrics.data}
          config={config}
          startDate={startDate}
          endDate={endDate}
          peakLineDashed
        />
      );
    }
    if (metric === 'service') {
      if (!tripMetrics.data || !predictedService.data)
        return <ChartPlaceHolder query={tripMetrics.isError ? tripMetrics : predictedService} />;
      return (
        <ServiceGraph
          data={tripMetrics.data}
          predictedData={predictedService.data}
          config={config}
          startDate={startDate}
          endDate={endDate}
        />
      );
    }
    if (metric === 'slowzones') {
      if (!delayTotals.data || !line || !lineShort) return <ChartPlaceHolder query={delayTotals} />;
      return (
        <TotalSlowTime
          data={delayTotals.data.data}
          startDateUTC={dayjs.utc(startDate)}
          endDateUTC={dayjs.utc(endDate)}
          line={line}
          lineShort={lineShort as Exclude<LineShort, 'Bus' | 'Commuter Rail'>}
          showTitle={false}
        />
      );
    }
    if (!ridership.data) return <ChartPlaceHolder query={ridership} />;
    return (
      <RidershipGraph
        data={ridership.data}
        config={config}
        startDate={startDate}
        endDate={endDate}
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

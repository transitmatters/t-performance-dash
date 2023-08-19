import React, { useCallback, useMemo } from 'react';
import type { AnnotationOptions } from 'chartjs-plugin-annotation';

import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS } from '../../common/constants/colors';
import type { ParamsType } from '../speed/constants/speeds';
import { PEAK_SCHEDULED_SERVICE } from '../../common/constants/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import { getShuttlingBlockAnnotations } from './utils/graphUtils';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';

interface ServiceGraphProps {
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const ServiceGraph: React.FC<ServiceGraphProps> = (props: ServiceGraphProps) => {
  const { data, predictedData, config, startDate, endDate, showTitle = false } = props;
  const { line } = useDelimitatedRoute();

  const peak = PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT'];

  const annotations = useMemo((): AnnotationOptions[] => {
    const shuttlingBlocks = getShuttlingBlockAnnotations(data);
    return [
      {
        type: 'line',
        yMin: peak,
        yMax: peak,
        borderColor: CHART_COLORS.ANNOTATIONS,
        // corresponds to null dataset index.
        display: (ctx) => ctx.chart.isDatasetVisible(2),
        borderWidth: 2,
      },
      ...shuttlingBlocks,
    ];
  }, [data, peak]);

  const labels = useMemo(() => {
    return data.map((point) => point.date);
  }, [data]);

  const scheduled = useMemo(() => {
    return {
      label: 'MBTA scheduled round trips',
      values: predictedData.counts.map((count, index) =>
        data[index]?.miles_covered > 0 && count ? count / 2 : Number.NaN
      ),
    };
  }, [data, predictedData]);

  const delivered = useMemo(() => {
    return {
      label: 'Daily round trips',
      values: data.map((datapoint) =>
        datapoint.miles_covered ? Math.round(datapoint.count) : Number.NaN
      ),
    };
  }, [data]);

  const label = useCallback(
    (context) => {
      return `${context.datasetIndex === 0 ? 'Actual:' : 'Scheduled:'} ${context.parsed.y} (${(
        (100 * context.parsed.y) /
        peak
      ).toFixed(1)}% of peak)`;
    },
    [peak]
  );

  return (
    <ScheduledAndDeliveredGraph
      title="Daily round trips"
      yAxisLabel="Round trips"
      labels={labels}
      scheduled={scheduled}
      delivered={delivered}
      annotations={annotations}
      tooltipLabel={label}
      config={config}
      startDate={startDate}
      endDate={endDate}
      showTitle={showTitle}
      peak={peak}
    />
  );
};

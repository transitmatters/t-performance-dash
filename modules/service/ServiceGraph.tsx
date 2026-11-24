import { useCallback, useMemo, useRef } from 'react';
import type { TooltipItem } from 'chart.js';

import { useLinePage } from '../../common/hooks/usePageParams';
import { useScheduledServiceBaseline } from '../../common/api/hooks/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { ChartActions } from '../../common/components/charts/ChartActions';
import { explainGapBlocks, usePageShutdowns } from '../shutdowns';
import { hexWithAlpha } from '../../common/utils/general';
import type { HoverCardContent } from '../../common/components/charts/hoverCard/types';
import type { DataPoint } from '../../common/components/charts/TimeSeriesChart/types';
import { hideBlocksExplainedByEvents, useMajorEvents } from '../../common/utils/majorEvents';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';
import { getNoDataSinceLatestBlock, getShuttlingBlockAnnotations } from './utils/graphUtils';
import { getScheduledAndDeliveredRoundTrips } from './utils/utils';
import { ServiceEmbedButton } from './ServiceEmbedButton';

interface ServiceGraphProps {
  config: ParamsType;
  data: DeliveredTripMetrics[];
  predictedData: Pick<ScheduledService, 'counts'>;
  startDate: string;
  endDate: string;
  fill?: boolean;
}

export const ServiceGraph = (props: ServiceGraphProps) => {
  const { data, predictedData, startDate, endDate, config, fill = false } = props;
  const { line, color: lineColor } = useLinePage();
  const ref = useRef(null);

  const peak = useScheduledServiceBaseline(line);

  const benchmarks = useMemo(() => {
    const label = `Historical maximum (${peak} round trips)`;
    return [{ label, value: peak }];
  }, [peak]);

  const shutdowns = usePageShutdowns('line', startDate, endDate);

  const hoverCard = useCallback(
    (items: TooltipItem<'line'>[]): HoverCardContent | null => {
      const valueOf = (datasetIndex: number) =>
        items.find((item) => item.datasetIndex === datasetIndex)?.parsed.y ?? undefined;
      const scheduledValue = valueOf(0);
      const deliveredValue = valueOf(1);
      if (!deliveredValue && !scheduledValue) return null;
      const percentOfPeak = (value: number) => `${((100 * value) / peak).toFixed(1)}%`;
      return {
        hero: deliveredValue
          ? { value: `${deliveredValue}`, unit: 'round trips', color: lineColor }
          : undefined,
        meter:
          deliveredValue && peak > 0
            ? {
                fraction: deliveredValue / peak,
                label: `${percentOfPeak(deliveredValue)} of historical maximum (${peak})`,
                color: lineColor,
              }
            : undefined,
        rows: scheduledValue
          ? [
              {
                label: 'Scheduled',
                value: `${scheduledValue}`,
                detail: peak > 0 ? `${percentOfPeak(scheduledValue)} of max` : undefined,
                color: hexWithAlpha(lineColor, 0.4),
                borderColor: lineColor,
              },
            ]
          : [],
      };
    },
    [peak, lineColor]
  );

  const events = useMajorEvents(line, startDate, endDate);

  const blocks = useMemo(() => {
    const shuttlingBlocks = getShuttlingBlockAnnotations(data).map((block) => ({
      from: typeof block.xMin === 'string' ? block.xMin : undefined,
      to: typeof block.xMax === 'string' ? block.xMax : undefined,
    }));
    return [
      ...hideBlocksExplainedByEvents(
        explainGapBlocks(shuttlingBlocks, shutdowns, { startDate, endDate, agg: config.agg }),
        events
      ),
      ...getNoDataSinceLatestBlock(data.map((point) => point.date)),
    ];
  }, [data, shutdowns, startDate, endDate, config.agg, events]);

  const roundTrips = useMemo(
    () => getScheduledAndDeliveredRoundTrips(data, predictedData, config.agg),
    [data, predictedData, config.agg]
  );

  const scheduled = useMemo(() => {
    return {
      label: 'Scheduled round trips',
      data: roundTrips.map(({ date, scheduled: count }) => ({ date, value: count })),
      style: {
        fillPattern: 'striped' as const,
        tooltipLabel: (point: DataPoint) => {
          const percentOfPeak = `${((100 * (point.value ?? 0)) / peak).toFixed(1)}%`;
          return `Scheduled: ${point.value} (${percentOfPeak} of peak)`;
        },
      },
    };
  }, [roundTrips, peak]);

  const delivered = useMemo(() => {
    return {
      label: 'Daily round trips',
      data: roundTrips.map(({ date, delivered: count }) => ({ date, value: count })),
      style: {
        tooltipLabel: (point: DataPoint) => {
          const percentOfPeak = `${((100 * (point.value ?? 0)) / peak).toFixed(1)}%`;
          return `Actual: ${point.value} (${percentOfPeak} of peak)`;
        },
      },
    };
  }, [roundTrips, peak]);

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <ScheduledAndDeliveredGraph
        valueAxisLabel="Round trips"
        scheduled={scheduled}
        delivered={delivered}
        blocks={blocks}
        benchmarks={benchmarks}
        hoverCard={hoverCard}
        startDate={startDate}
        endDate={endDate}
        agg={config.agg}
        fill={fill}
        chartRef={ref}
      />

      <ChartActions
        datasetName="service"
        chartRef={ref}
        csv={data}
        startDate={startDate}
        endDate={endDate}
        embed={<ServiceEmbedButton chart="round-trips" />}
      />
    </ChartStack>
  );
};

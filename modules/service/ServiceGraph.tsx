import { useCallback, useMemo } from 'react';
import type { TooltipItem } from 'chart.js';

import { useDelimitatedRoute } from '../../common/utils/router';
import { useScheduledServiceBaseline } from '../../common/api/hooks/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { DownloadButton } from '../../common/components/buttons/DownloadButton';
import { explainGapBlocks, usePageShutdowns } from '../shutdowns';
import { LINE_COLORS } from '../../common/constants/colors';
import { hexWithAlpha } from '../../common/utils/general';
import type { HoverCardContent } from '../../common/components/charts/hoverCard/types';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';
import { getNoDataSinceLatestBlock, getShuttlingBlockAnnotations } from './utils/graphUtils';
import { getScheduledAndDeliveredRoundTrips } from './utils/utils';

interface ServiceGraphProps {
  config: ParamsType;
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  startDate: string;
  endDate: string;
}

export const ServiceGraph = (props: ServiceGraphProps) => {
  const { data, predictedData, startDate, endDate, config } = props;
  const { line } = useDelimitatedRoute();
  const lineColor = LINE_COLORS[line ?? 'default'];

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

  const blocks = useMemo(() => {
    const shuttlingBlocks = getShuttlingBlockAnnotations(data).map((block) => ({
      from: block.xMin as string,
      to: block.xMax as string,
    }));
    return [
      ...explainGapBlocks(shuttlingBlocks, shutdowns, { startDate, endDate }),
      ...getNoDataSinceLatestBlock(data.map((point) => point.date)),
    ];
  }, [data, shutdowns, startDate, endDate]);

  const roundTrips = useMemo(
    () => getScheduledAndDeliveredRoundTrips(data, predictedData, config.agg),
    [data, predictedData, config.agg]
  );

  const scheduled = useMemo(() => {
    return {
      label: 'Scheduled round trips',
      data: roundTrips.map(({ date, scheduled }) => ({ date, value: scheduled })),
      style: {
        fillPattern: 'striped' as const,
        tooltipLabel: (point) => {
          const percentOfPeak = `${((100 * point.value) / peak).toFixed(1)}%`;
          return `Scheduled: ${point.value} (${percentOfPeak} of peak)`;
        },
      },
    };
  }, [roundTrips, peak]);

  const delivered = useMemo(() => {
    return {
      label: 'Daily round trips',
      data: roundTrips.map(({ date, delivered }) => ({ date, value: delivered })),
      style: {
        tooltipLabel: (point) => {
          const percentOfPeak = `${((100 * point.value) / peak).toFixed(1)}%`;
          return `Actual: ${point.value} (${percentOfPeak} of peak)`;
        },
      },
    };
  }, [roundTrips, peak]);

  return (
    <ChartStack>
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
      />

      <div className="flex flex-row items-end justify-end gap-4">
        {startDate && (
          <DownloadButton
            data={data}
            datasetName="service"
            includeBothStopsForLocation={false}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>
    </ChartStack>
  );
};

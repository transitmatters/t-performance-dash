import React, { useMemo } from 'react';

import { useDelimitatedRoute } from '../../common/utils/router';
import { PEAK_SCHEDULED_SERVICE } from '../../common/constants/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { DownloadButton } from '../../common/components/buttons/DownloadButton';
import { indexByProperty } from '../../common/utils/array';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';
import { getShuttlingBlockAnnotations } from './utils/graphUtils';

interface ServiceGraphProps {
  config: ParamsType;
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  startDate: string;
  endDate: string;
}

export const ServiceGraph: React.FC<ServiceGraphProps> = (props: ServiceGraphProps) => {
  const { data, predictedData, startDate, endDate, config } = props;
  const { line } = useDelimitatedRoute();

  const peak = PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT'];

  const benchmarks = useMemo(() => {
    const label = `Historical maximum (${peak} round trips)`;
    return [{ label, value: peak }];
  }, [peak]);

  const blocks = useMemo(() => {
    const shuttlingBlocks = getShuttlingBlockAnnotations(data);
    return shuttlingBlocks.map((block) => ({
      from: block.xMin as string,
      to: block.xMax as string,
    }));
  }, [data]);

  const allDates = [
    ...new Set([
      ...predictedData.counts.map((point) => point.date),
      ...data.map((point) => point.date),
    ]),
  ].sort((a, b) => (a > b ? 1 : -1));

  const scheduledDataByDate = indexByProperty(predictedData.counts, 'date');
  const deliveredDataByDate = indexByProperty(data, 'date');

  console.log(allDates);

  const scheduled = useMemo(() => {
    return {
      label: 'Scheduled round trips',
      data: allDates.map((date) => {
        const scheduledToday = scheduledDataByDate[date];
        const deliveredToday = deliveredDataByDate[date];
        const anyDeliveredToday = deliveredToday?.miles_covered > 0;
        const value =
          scheduledToday.count && anyDeliveredToday ? Math.round(scheduledToday.count) / 2 : 0;
        return { date, value };
      }),
      style: {
        fillPattern: 'striped' as const,
        tooltipLabel: (point) => {
          const percentOfPeak = `${((100 * point.value) / peak).toFixed(1)}%`;
          return `Scheduled: ${point.value} (${percentOfPeak} of peak)`;
        },
      },
    };
  }, [allDates, deliveredDataByDate, peak, scheduledDataByDate]);

  const delivered = useMemo(() => {
    return {
      label: 'Daily round trips',
      data: allDates.map((date) => {
        const deliveredToday = deliveredDataByDate[date];
        const value = deliveredToday?.miles_covered ? Math.round(deliveredToday.count) : 0;
        return { date, value };
      }),
      style: {
        tooltipLabel: (point) => {
          const percentOfPeak = `${((100 * point.value) / peak).toFixed(1)}%`;
          return `Actual: ${point.value} (${percentOfPeak} of peak)`;
        },
      },
    };
  }, [data, peak]);

  return (
    <ChartBorder>
      <ScheduledAndDeliveredGraph
        valueAxisLabel="Round trips"
        scheduled={scheduled}
        delivered={delivered}
        blocks={blocks}
        benchmarks={benchmarks}
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
    </ChartBorder>
  );
};

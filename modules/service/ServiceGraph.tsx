import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDelimitatedRoute } from '../../common/utils/router';
import { useScheduledServiceBaseline } from '../../common/api/hooks/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
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
  const { t } = useTranslation('service');
  const { data, predictedData, startDate, endDate, config } = props;
  const { line } = useDelimitatedRoute();

  const peak = useScheduledServiceBaseline(line);

  const benchmarks = useMemo(() => {
    const label = t('graph.historicalMaximum', { peak });
    return [{ label, value: peak }];
  }, [peak, t]);

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

  const scheduled = useMemo(() => {
    return {
      label: t('graph.scheduledRoundTrips'),
      data: allDates.map((date) => {
        const scheduledToday = scheduledDataByDate[date];
        const deliveredToday = deliveredDataByDate[date];
        const anyDeliveredToday = deliveredToday && deliveredToday.miles_covered > 0;
        const value =
          scheduledToday?.count && anyDeliveredToday ? Math.round(scheduledToday?.count) / 2 : 0;
        return { date, value };
      }),
      style: {
        fillPattern: 'striped' as const,
        tooltipLabel: (point) => {
          const percentOfPeak = `${((100 * point.value) / peak).toFixed(1)}%`;
          return t('graph.scheduledTooltip', { value: point.value, percent: percentOfPeak });
        },
      },
    };
  }, [allDates, deliveredDataByDate, peak, scheduledDataByDate, t]);

  const delivered = useMemo(() => {
    return {
      label: t('dailyRoundTrips'),
      data: allDates.map((date) => {
        const deliveredToday = deliveredDataByDate[date];
        const value = deliveredToday?.miles_covered ? Math.round(deliveredToday.count) : 0;
        return { date, value };
      }),
      style: {
        tooltipLabel: (point) => {
          const percentOfPeak = `${((100 * point.value) / peak).toFixed(1)}%`;
          return t('graph.actualTooltip', { value: point.value, percent: percentOfPeak });
        },
      },
    };
  }, [data, peak, t]);

  return (
    <ChartStack>
      <ScheduledAndDeliveredGraph
        valueAxisLabel={t('graph.axis')}
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
    </ChartStack>
  );
};

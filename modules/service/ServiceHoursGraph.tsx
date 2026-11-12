import { useMemo, useRef } from 'react';

import type { FetchServiceHoursResponse } from '../../common/types/api';
import type { AggType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { ChartActions } from '../../common/components/charts/ChartActions';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';
import { getNoDataSinceLatestBlock } from './utils/graphUtils';
import { ServiceEmbedButton } from './ServiceEmbedButton';

interface ServiceHoursGraphProps {
  serviceHours: FetchServiceHoursResponse;
  agg: AggType;
  startDate: string;
  endDate: string;
  /** Fill the parent's height, as an embed does. */
  fill?: boolean;
}

export const ServiceHoursGraph = (props: ServiceHoursGraphProps) => {
  const { serviceHours, agg, startDate, endDate, fill = false } = props;
  const ref = useRef(null);

  const scheduled = useMemo(() => {
    return {
      label: 'Scheduled service hours',
      data: serviceHours.map((sh) => ({ date: sh.date, value: sh.scheduled })),
      style: { fillPattern: 'striped' as const },
    };
  }, [serviceHours]);

  const delivered = useMemo(() => {
    return {
      label: 'Delivered service hours',
      data: serviceHours.map((sh) => ({ date: sh.date, value: sh.delivered })),
    };
  }, [serviceHours]);

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <ScheduledAndDeliveredGraph
        scheduled={scheduled}
        delivered={delivered}
        startDate={startDate}
        endDate={endDate}
        agg={agg}
        valueAxisLabel="Service hours"
        blocks={getNoDataSinceLatestBlock(serviceHours.map((sh) => sh.date))}
        fill={fill}
        chartRef={ref}
      />
      <ChartActions
        datasetName="service-hours"
        chartRef={ref}
        csv={serviceHours}
        startDate={startDate}
        endDate={endDate}
        embed={<ServiceEmbedButton chart="hours" />}
      />
    </ChartStack>
  );
};

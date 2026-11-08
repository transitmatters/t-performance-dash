import { useMemo } from 'react';

import type { FetchServiceHoursResponse } from '../../common/types/api';
import type { AggType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';
import { getNoDataSinceLatestBlock } from './utils/graphUtils';
import { ServiceEmbedButton } from './ServiceEmbedButton';

interface ServiceHoursGraphProps {
  serviceHours: FetchServiceHoursResponse;
  agg: AggType;
  startDate: string;
  endDate: string;
  /** Fill the parent's height and leave out the Embed button, as an embed does. */
  fill?: boolean;
}

export const ServiceHoursGraph = (props: ServiceHoursGraphProps) => {
  const { serviceHours, agg, startDate, endDate, fill = false } = props;

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
      />
      {!fill && (
        <div className="flex flex-row items-end justify-end gap-4">
          <ServiceEmbedButton chart="hours" />
        </div>
      )}
    </ChartStack>
  );
};

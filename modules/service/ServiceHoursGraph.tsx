import React, { useMemo } from 'react';

import type { FetchServiceHoursResponse } from '../../common/types/api';
import type { AggType } from '../speed/constants/speeds';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';

interface ServiceHoursGraphProps {
  serviceHours: FetchServiceHoursResponse;
  agg: AggType;
  startDate: string;
  endDate: string;
}

export const ServiceHoursGraph: React.FC<ServiceHoursGraphProps> = (
  props: ServiceHoursGraphProps
) => {
  const { serviceHours, agg, startDate, endDate } = props;

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
    <ChartBorder>
      <ScheduledAndDeliveredGraph
        scheduled={scheduled}
        delivered={delivered}
        startDate={startDate}
        endDate={endDate}
        agg={agg}
        valueAxisLabel="Service hours"
      />
    </ChartBorder>
  );
};

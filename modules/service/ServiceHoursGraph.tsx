/* eslint-disable import/no-unused-modules */
import React, { useMemo } from 'react';

import type { FetchServiceHoursResponse } from '../../common/types/api';
import type { AggType } from '../speed/constants/speeds';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraphNew';

interface ServiceGraphProps {
  serviceHours: FetchServiceHoursResponse;
  agg: AggType;
}

export const ServiceHoursGraph: React.FC<ServiceGraphProps> = (props: ServiceGraphProps) => {
  const { serviceHours, agg } = props;

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
    <ScheduledAndDeliveredGraph
      scheduled={scheduled}
      delivered={delivered}
      agg={agg}
      valueAxisLabel="Service hours"
    />
  );
};

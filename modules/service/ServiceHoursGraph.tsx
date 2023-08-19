/* eslint-disable import/no-unused-modules */
import React, { useCallback, useMemo } from 'react';

import type { ParamsType } from '../speed/constants/speeds';
import type { FetchServiceHoursResponse } from '../../common/types/api';
import { ScheduledAndDeliveredGraph } from './ScheduledAndDeliveredGraph';

interface ServiceGraphProps {
  serviceHours: FetchServiceHoursResponse;
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const ServiceHoursGraph: React.FC<ServiceGraphProps> = (props: ServiceGraphProps) => {
  const { serviceHours, config, startDate, endDate, showTitle = false } = props;

  const labels = useMemo(() => {
    return serviceHours.map((sh) => sh.date);
  }, [serviceHours]);

  const scheduled = useMemo(() => {
    return {
      label: 'MBTA scheduled service hours',
      values: serviceHours.map((sh) => sh.scheduled),
    };
  }, [serviceHours]);

  const delivered = useMemo(() => {
    return {
      label: 'Service hours',
      values: serviceHours.map((sh) => sh.delivered),
    };
  }, [serviceHours]);

  const label = useCallback((context) => {
    return `${context.datasetIndex === 0 ? 'Actual:' : 'Scheduled:'} ${context.parsed.y}`;
  }, []);

  return (
    <ScheduledAndDeliveredGraph
      title="Daily service hours"
      yAxisLabel="Service hours"
      labels={labels}
      scheduled={scheduled}
      delivered={delivered}
      annotations={[]}
      tooltipLabel={label}
      config={config}
      startDate={startDate}
      endDate={endDate}
      showTitle={showTitle}
    />
  );
};

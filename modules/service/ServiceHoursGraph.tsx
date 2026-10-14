import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FetchServiceHoursResponse } from '../../common/types/api';
import type { AggType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
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
  const { t } = useTranslation('service');
  const { serviceHours, agg, startDate, endDate } = props;

  const scheduled = useMemo(() => {
    return {
      label: t('serviceHours.scheduled'),
      data: serviceHours.map((sh) => ({ date: sh.date, value: sh.scheduled })),
      style: { fillPattern: 'striped' as const },
    };
  }, [serviceHours, t]);

  const delivered = useMemo(() => {
    return {
      label: t('serviceHours.delivered'),
      data: serviceHours.map((sh) => ({ date: sh.date, value: sh.delivered })),
    };
  }, [serviceHours, t]);

  return (
    <ChartStack>
      <ScheduledAndDeliveredGraph
        scheduled={scheduled}
        delivered={delivered}
        startDate={startDate}
        endDate={endDate}
        agg={agg}
        valueAxisLabel={t('serviceHours.axis')}
      />
    </ChartStack>
  );
};

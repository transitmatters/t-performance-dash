import React from 'react';
import classNames from 'classnames';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { PercentageWidgetValue, TripsWidgetValue } from '../../common/types/basicWidgets';
import type { ParamsType } from '../speed/constants/speeds';
import { ServiceGraph } from './ServiceGraph';
import { getServiceWidgetValues } from './utils/utils';

interface ServiceOverviewWrapperProps {
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const ServiceOverviewWrapper: React.FC<ServiceOverviewWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
}) => {
  const { average, percentDelivered } = getServiceWidgetValues(data, predictedData.counts);

  return (
    <>
      <div className={classNames('space-between flex w-full flex-row gap-2')}>
        <BasicWidgetDataLayout
          title={`Service Delivered`}
          widgetValue={new PercentageWidgetValue(percentDelivered, undefined)}
          layoutKind="no-delta"
          analysis="of scheduled"
          sentimentDirection={'positiveOnIncrease'}
        />
        <BasicWidgetDataLayout
          title={'Average (actual)'}
          widgetValue={new TripsWidgetValue(average, undefined)}
          analysis={`over period`}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </div>
      <div className={classNames('h-60 pr-4')}>
        <ServiceGraph
          config={config}
          data={data}
          predictedData={predictedData}
          startDate={startDate}
          endDate={endDate}
          showTitle
        />
      </div>
    </>
  );
};

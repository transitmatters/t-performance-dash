import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TripsWidgetValue } from '../../common/types/basicWidgets';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import type { ParamsType } from '../speed/constants/speeds';
import { ServiceGraph } from './ServiceGraph';
import { getOverviewServiceWidgetValues } from './utils/utils';

interface ServiceOverviewWrapperProps {
  data: SpeedDataPoint[];
  config: ParamsType;
  line: Line;
  startDate: string;
  endDate: string;
}

export const ServiceOverviewWrapper: React.FC<ServiceOverviewWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  const { current, delta, average } = getOverviewServiceWidgetValues(data);

  return (
    <>
      <div className={classNames('space-between flex w-full flex-row')}>
        <BasicWidgetDataLayout
          title={config.getWidgetTitle(data[data.length - 1].date)}
          widgetValue={new TripsWidgetValue(current, delta)}
          analysis="over period"
          sentimentDirection={'positiveOnIncrease'}
        />
        <BasicWidgetDataLayout
          title={'Average'}
          widgetValue={new TripsWidgetValue(average, undefined)}
          analysis={`${dayjs(startDate).format(PRETTY_DATE_FORMAT)} - ${dayjs(endDate).format(
            PRETTY_DATE_FORMAT
          )}`}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </div>
      <div className={classNames('h-60 pr-4')}>
        <ServiceGraph
          config={config}
          data={data}
          startDate={startDate}
          endDate={endDate}
          showTitle
        />
      </div>
    </>
  );
};

import React from 'react';
import classNames from 'classnames';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { TripsWidgetValue } from '../../common/types/basicWidgets';
import { getDetailsServiceWidgetValues } from './utils/utils';
import { ServiceGraph } from './ServiceGraph';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetTitle } from '../dashboard/WidgetTitle';

interface ServiceDetailsWrapperProps {
  data: SpeedDataPoint[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const ServiceDetailsWrapper: React.FC<ServiceDetailsWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  const { current, delta, average, peak } = getDetailsServiceWidgetValues(data);

  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Daily Round Trips" />
        <div className={classNames('flex h-60 flex-row items-center pr-4')}>
          <ServiceGraph config={config} data={data} startDate={startDate} endDate={endDate} />
        </div>
      </WidgetDiv>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={`Current (${config.getWidgetTitle(data[data.length - 1].date)})`}
            widgetValue={new TripsWidgetValue(current, delta)}
            analysis="over period"
            sentimentDirection={'positiveOnIncrease'}
          />
        </WidgetDiv>
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={'Average'}
            widgetValue={new TripsWidgetValue(average, undefined)}
            analysis={'Over this period'}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetDiv>
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={'Peak'}
            widgetValue={new TripsWidgetValue(peak.value, undefined)}
            analysis={config.getWidgetTitle(peak.date)}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetDiv>
      </div>
    </>
  );
};

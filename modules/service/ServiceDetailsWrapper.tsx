import React, { useState } from 'react';
import classNames from 'classnames';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { TripsWidgetValue } from '../../common/types/basicWidgets';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { getServiceWidgetValues } from './utils/utils';
import { ServiceGraph } from './ServiceGraph';
import { PercentageServiceGraph } from './PercentageServiceGraph';

interface ServiceDetailsWrapperProps {
  data: SpeedDataPoint[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const ServiceDetailsWrapper: React.FC<ServiceDetailsWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
}) => {
  const { current, delta, average, peak } = getServiceWidgetValues(data, predictedData.counts);
  const [comparison, setComparison] = useState<'Baseline' | 'Scheduled'>('Scheduled');
  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Daily Round Trips" />
        <div className={classNames('flex h-60 flex-row items-center pr-4')}>
          <ServiceGraph
            config={config}
            data={data}
            startDate={startDate}
            endDate={endDate}
            predictedData={predictedData}
          />
        </div>
      </WidgetDiv>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={`Current (actual) - ${config.getWidgetTitle(data[data.length - 1].date)}`}
            widgetValue={new TripsWidgetValue(current, delta)}
            analysis="over period"
            sentimentDirection={'positiveOnIncrease'}
          />
        </WidgetDiv>
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={'Average (actual)'}
            widgetValue={new TripsWidgetValue(average, undefined)}
            analysis={'Over this period'}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetDiv>
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={'Peak (actual)'}
            widgetValue={new TripsWidgetValue(peak ? peak.count / 2 : undefined, undefined)}
            analysis={config.getWidgetTitle(peak?.date)}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetDiv>
      </div>
      <WidgetDiv>
        <WidgetTitle title={`${comparison} Service Delivered`} />
        <div className={classNames('flex h-60 flex-row items-center pr-4')}>
          <PercentageServiceGraph
            config={config}
            data={data}
            startDate={startDate}
            endDate={endDate}
            predictedData={predictedData}
            comparison={comparison}
          />
        </div>
        <div className={'flex w-full justify-center pt-2'}>
          <ButtonGroup
            options={Object.entries({ Scheduled: 'Scheduled', Baseline: 'Baseline' })}
            pressFunction={setComparison}
            additionalDivClass="md:w-auto"
            additionalButtonClass="md:w-fit"
          />
        </div>
      </WidgetDiv>
    </>
  );
};

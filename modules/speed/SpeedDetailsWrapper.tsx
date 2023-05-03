import React from 'react';
import classNames from 'classnames';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import { getDetailsSpeedWidgetValues } from './utils/utils';
import { SpeedGraph } from './SpeedGraph';
import type { ParamsType } from './constants/speeds';

interface SpeedDetailsWrapperProps {
  data: SpeedDataPoint[];
  config: ParamsType;
  line: Line;
  startDate: string;
  endDate: string;
}

export const SpeedDetailsWrapper: React.FC<SpeedDetailsWrapperProps> = ({
  data,
  config,
  line,
  startDate,
  endDate,
}) => {
  const dataWithoutNulls = data.filter((datapoint) => datapoint.value !== null);
  const { current, delta, average, peak } = getDetailsSpeedWidgetValues(dataWithoutNulls, line);

  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Median Speed" />
        <div className={classNames('flex h-60 flex-row items-center pr-4')}>
          <SpeedGraph config={config} data={data} startDate={startDate} endDate={endDate} />
        </div>
      </WidgetDiv>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={`Current (${config.getWidgetTitle(
              dataWithoutNulls[dataWithoutNulls.length - 1].date
            )})`}
            widgetValue={new MPHWidgetValue(current, delta)}
            analysis="over period"
            sentimentDirection={'positiveOnIncrease'}
          />
        </WidgetDiv>
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={'Average'}
            widgetValue={new MPHWidgetValue(average, undefined)}
            analysis={'Over this period'}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetDiv>
        <WidgetDiv className="w-full">
          <BasicWidgetDataLayout
            title={'Peak'}
            widgetValue={new MPHWidgetValue(peak.value, undefined)}
            analysis={config.getWidgetTitle(peak.date)}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetDiv>
      </div>
    </>
  );
};

import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import { getOverviewSpeedWidgetValues } from './utils/utils';
import { SpeedGraph } from './SpeedGraph';
import type { ParamsType } from './constants/speeds';

interface TotalSlowTimeWrapperProps {
  data: SpeedDataPoint[];
  config: ParamsType;
  line: Line;
  startDate: string;
  endDate: string;
}

export const SpeedGraphWrapper: React.FC<TotalSlowTimeWrapperProps> = ({
  data,
  config,
  line,
  startDate,
  endDate,
}) => {
  const { current, delta, average } = getOverviewSpeedWidgetValues(data, line);

  return (
    <>
      <div className={classNames('space-between flex w-full flex-row')}>
        <BasicWidgetDataLayout
          title={config.getWidgetTitle(data[data.length - 1].date)}
          widgetValue={new MPHWidgetValue(current, delta)}
          analysis="over period"
          sentimentDirection={'positiveOnIncrease'}
        />
        <BasicWidgetDataLayout
          title={'Average'}
          widgetValue={new MPHWidgetValue(average, undefined)}
          analysis={`${dayjs(startDate).format(PRETTY_DATE_FORMAT)} - ${dayjs(endDate).format(
            PRETTY_DATE_FORMAT
          )}`}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </div>
      <div className={classNames('h-60 pr-4')}>
        <SpeedGraph config={config} data={data} startDate={startDate} endDate={endDate} />
      </div>
    </>
  );
};

import React from 'react';
import classNames from 'classnames';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { useDelimitatedRoute } from '../../common/utils/router';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import { OverviewRangeTypes } from '../../common/constants/dates';
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
  const dataNoNulls = data.filter((datapoint) => datapoint.value !== null);
  const { current, delta, average } = getOverviewSpeedWidgetValues(dataNoNulls, line);
  const {
    query: { view },
  } = useDelimitatedRoute();
  return (
    <>
      <div className={classNames('space-between flex w-full flex-row gap-2')}>
        <BasicWidgetDataLayout
          title={config.getWidgetTitle(dataNoNulls[dataNoNulls.length - 1].date)}
          widgetValue={new MPHWidgetValue(current, delta)}
          analysis={`from peak (${view ? OverviewRangeTypes[view] : ''})`}
          sentimentDirection={'positiveOnIncrease'}
        />
        <BasicWidgetDataLayout
          title={'Average'}
          widgetValue={new MPHWidgetValue(average, undefined)}
          analysis={`over period`}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </div>
      <div className="h-60 pr-4">
        <SpeedGraph config={config} data={data} startDate={startDate} endDate={endDate} showTitle />
      </div>
    </>
  );
};

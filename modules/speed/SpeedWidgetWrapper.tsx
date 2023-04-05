import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import type { TimeRange } from '../../common/types/inputs';
import { getSpeedWidgetValues } from './utils/utils';
import { SpeedGraph } from './SpeedGraph';

interface TotalSlowTimeWrapperProps {
  data: SpeedDataPoint[];
  compData: SpeedDataPoint[];
  timeRange: TimeRange;
  line: Line;
}

export const SpeedGraphWrapper: React.FC<TotalSlowTimeWrapperProps> = ({
  data,
  compData,
  timeRange,
  line,
}) => {
  const { average, delta } = useMemo(() => {
    return getSpeedWidgetValues(data, compData, line);
  }, [data, compData, line]);

  return (
    <>
      <div className={classNames('space-between flex w-full flex-row')}>
        <BasicWidgetDataLayout
          title="Average Speed"
          widgetValue={new MPHWidgetValue(average, delta)}
          analysis={`from prev. ${timeRange}`}
          sentimentDirection={'positiveOnIncrease'}
        />
      </div>
      <div className={classNames('h-60 pr-4')}>
        <SpeedGraph timeRange={timeRange} data={data} />
      </div>
    </>
  );
};

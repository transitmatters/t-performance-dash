import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import { getSpeedWidgetValues } from './utils/utils';
import { SpeedGraph } from './SpeedGraph';
import { ParamsType } from './constants/speeds';

interface TotalSlowTimeWrapperProps {
  data: SpeedDataPoint[];
  config: ParamsType;
  line: Line;
}

export const SpeedGraphWrapper: React.FC<TotalSlowTimeWrapperProps> = ({ data, config, line }) => {
  const { current, delta } = useMemo(() => {
    return getSpeedWidgetValues(data, line);
  }, [data, line]);

  return (
    <>
      <div className={classNames('space-between flex w-full flex-row')}>
        <BasicWidgetDataLayout
          title="Current Speed"
          widgetValue={new MPHWidgetValue(current, delta)}
          analysis={`over period.`}
          sentimentDirection={'positiveOnIncrease'}
        />
      </div>
      <div className={classNames('h-60 pr-4')}>
        <SpeedGraph config={config} data={data} />
      </div>
    </>
  );
};

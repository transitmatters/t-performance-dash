import React from 'react';
import classNames from 'classnames';
import type { RidershipCount } from '../../common/types/dataPoints';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { useDelimitatedRoute } from '../../common/utils/router';
import { PercentageWidgetValue, TripsWidgetValue } from '../../common/types/basicWidgets';
import type { ParamsType } from '../speed/constants/speeds';
import { getRidershipWidgetValues } from './utils/utils';
import { RidershipGraph } from './RidershipGraph';

interface RidershipOverviewWrapperProps {
  data: RidershipCount[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const RidershipOverviewWrapper: React.FC<RidershipOverviewWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  const { line } = useDelimitatedRoute();
  const { average, percentage } = getRidershipWidgetValues(data, line);

  return (
    <>
      <div className={classNames('space-between flex w-full flex-row')}>
        <BasicWidgetDataLayout
          title={`Compare to Peak`}
          widgetValue={new PercentageWidgetValue(percentage, undefined)}
          layoutKind="no-delta"
          analysis="This week"
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
        <RidershipGraph
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

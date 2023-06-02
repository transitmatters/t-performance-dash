import React from 'react';
import classNames from 'classnames';
import type { RidershipCount } from '../../common/types/dataPoints';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { RidershipGraph } from './RidershipGraph';

interface RidershipDetailsWrapperProps {
  data: RidershipCount[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const RidershipDetailsWrapper: React.FC<RidershipDetailsWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Daily Trips" />
        <div className={classNames('flex h-60 flex-row items-center pr-4')}>
          <RidershipGraph config={config} data={data} startDate={startDate} endDate={endDate} />
        </div>
      </WidgetDiv>
    </>
  );
};

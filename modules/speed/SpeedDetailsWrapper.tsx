import React from 'react';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import type { ParamsType } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

interface SpeedDetailsWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const SpeedDetailsWrapper: React.FC<SpeedDetailsWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Speed" />
        <SpeedGraphWrapper data={data} config={config} startDate={startDate} endDate={endDate} />
      </WidgetDiv>
    </>
  );
};

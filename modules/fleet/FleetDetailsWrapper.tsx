import React from 'react';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import type { ParamsType } from '../speed/constants/speeds';
import { FleetGraphWrapper } from './FleetGraphWrapper';

interface FleetDetailsWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const FleetDetailsWrapper: React.FC<FleetDetailsWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Fleet" />
        <FleetGraphWrapper data={data} config={config} startDate={startDate} endDate={endDate} />
      </WidgetDiv>
    </>
  );
};

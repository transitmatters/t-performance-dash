import React from 'react';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import type { ParamsType } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

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
  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Median speed" />
        <SpeedGraphWrapper
          data={data}
          config={config}
          line={line}
          startDate={startDate}
          endDate={endDate}
        />
      </WidgetDiv>
    </>
  );
};

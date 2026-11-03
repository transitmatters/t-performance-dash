import React from 'react';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { useDelimitatedRoute } from '../../common/utils/router';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { SlowZonesWidgetTitle } from '../slowzones/SlowZonesWidgetTitle';
import { LegendSpeedMap } from '../../common/components/charts/Legend';
import type { ParamsType } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';
import { SegmentSpeedMap } from './map/SegmentSpeedMap';

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
  const { lineShort } = useDelimitatedRoute();
  return (
    <>
      <WidgetDiv>
        <WidgetTitle title="Speed" subtitle={'Speed across line (including dwells)'} />
        <SpeedGraphWrapper data={data} config={config} startDate={startDate} endDate={endDate} />
      </WidgetDiv>
      {lineShort !== 'Mattapan' && lineShort !== 'Bus' && lineShort !== 'Commuter Rail' ? (
        <WidgetDiv>
          <SlowZonesWidgetTitle subtitle="Speed between stations (excluding dwells)" />
          <CarouselGraphDiv>
            <SegmentSpeedMap key={lineShort} lineName={lineShort} direction={'horizontal'} />
            <LegendSpeedMap />
          </CarouselGraphDiv>
        </WidgetDiv>
      ) : null}
    </>
  );
};

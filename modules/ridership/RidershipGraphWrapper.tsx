import React from 'react';
import type { RidershipCount } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { PercentageWidgetValue, RidersWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { getRidershipWidgetValues } from './utils/utils';
import { RidershipGraph } from './RidershipGraph';
interface RidershipGraphWrapperProps {
  data: RidershipCount[];
  lineOrRoute: string;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const RidershipGraphWrapper: React.FC<RidershipGraphWrapperProps> = ({
  data,
  lineOrRoute,
  config,
  startDate,
  endDate,
}) => {
  const { average, percentage } = getRidershipWidgetValues(data, lineOrRoute);

  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          widgetValue={new RidersWidgetValue(average)}
          sentimentDirection={'positiveOnIncrease'}
          analysis={`Average`}
          layoutKind="no-delta"
        />
        <WidgetForCarousel
          analysis={'of baseline'}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
          widgetValue={new PercentageWidgetValue(percentage)}
        />
      </WidgetCarousel>
      <RidershipGraph config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};

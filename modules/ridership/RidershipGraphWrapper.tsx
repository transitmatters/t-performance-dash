import React from 'react';
import type { RidershipCount } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { PercentageWidgetValue, RidersWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getRidershipWidgetValues } from './utils/utils';
import { RidershipGraph } from './RidershipGraph';
import { BusRoute, Line } from '../../common/types/lines';
interface RidershipGraphWrapperProps {
  data: RidershipCount[];
  line: Line;
  busRoute: BusRoute | undefined;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const RidershipGraphWrapper: React.FC<RidershipGraphWrapperProps> = ({
  data,
  line,
  busRoute,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => datapoint.count !== null)) return <NoDataNotice isLineMetric />;
  const { average, percentage } = getRidershipWidgetValues(data, line, busRoute);

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

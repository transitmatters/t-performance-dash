import React from 'react';
import type { RidershipCount } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { PercentageWidgetValue, RidersWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { BusRoute, Line } from '../../common/types/lines';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getRidershipWidgetValues } from './utils/utils';
import { RidershipGraph } from './RidershipGraph';

interface RidershipGraphWrapperProps {
  data: RidershipCount[];
  line?: Line;
  busRoute?: BusRoute | undefined;
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
  const { average, percentage, peak } = getRidershipWidgetValues(data, line, busRoute);

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
          analysis={'of Historical Maximum'}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
          widgetValue={new PercentageWidgetValue(percentage)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          sentimentDirection={'positiveOnIncrease'}
          analysis={`Max - ${config.getWidgetTitle(peak.date)}`}
          widgetValue={new RidersWidgetValue(peak ? peak.count : undefined)}
        />
      </WidgetCarousel>
      <RidershipGraph config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};

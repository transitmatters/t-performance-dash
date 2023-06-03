import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import type { Line } from '../../common/types/lines';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import { SpeedGraph } from './SpeedGraph';
import { getDetailsSpeedWidgetValues } from './utils/utils';
import type { ParamsType } from './constants/speeds';

interface SpeedGraphWrapperProps {
  data: SpeedDataPoint[];
  config: ParamsType;
  line: Line;
  startDate: string;
  endDate: string;
}

export const SpeedGraphWrapper: React.FC<SpeedGraphWrapperProps> = ({
  data,
  line,
  config,
  startDate,
  endDate,
}) => {
  const dataNoNulls = data.filter((datapoint) => datapoint.value !== null);
  const { current, delta, average, peak } = getDetailsSpeedWidgetValues(dataNoNulls, line);

  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          widgetValue={new MPHWidgetValue(average, undefined)}
          analysis={'Average'}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
        <WidgetForCarousel
          widgetValue={new MPHWidgetValue(current, delta)}
          analysis={`Current (${config.getWidgetTitle(dataNoNulls[dataNoNulls.length - 1].date)})`}
          layoutKind="no-delta"
          sentimentDirection={'positiveOnIncrease'}
        />
        <WidgetForCarousel
          widgetValue={new MPHWidgetValue(peak.value, undefined)}
          analysis={`Peak (${config.getWidgetTitle(peak.date)})`}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </WidgetCarousel>
      <SpeedGraph config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};

import React from 'react';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { ParamsType } from '../speed/constants/speeds';
import { ServiceGraph } from './ServiceGraph';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { TripsWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { getServiceWidgetValues } from './utils/utils';
interface ServiceDetailsWrapperProps {
  data: SpeedDataPoint[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const ServiceGraphWrapper: React.FC<ServiceDetailsWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
}) => {
  const { current, delta, average, peak } = getServiceWidgetValues(data, predictedData.counts);

  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          widgetValue={new TripsWidgetValue(current, delta)}
          sentimentDirection={'positiveOnIncrease'}
          analysis={`Current (actual) - ${config.getWidgetTitle(data[data.length - 1].date)}`}
          layoutKind="no-delta"
        />
        <WidgetForCarousel
          analysis={'Average (actual)'}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
          widgetValue={new TripsWidgetValue(average)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          sentimentDirection={'positiveOnIncrease'}
          analysis={`Peak (actual) - ${config.getWidgetTitle(peak.date)}`}
          widgetValue={new TripsWidgetValue(peak ? peak.count / 2 : undefined)}
        />
      </WidgetCarousel>
      <ServiceGraph
        config={config}
        data={data}
        startDate={startDate}
        endDate={endDate}
        predictedData={predictedData}
      />
    </CarouselGraphDiv>
  );
};

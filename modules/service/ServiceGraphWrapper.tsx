import React from 'react';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { TripsWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getServiceWidgetValues } from './utils/utils';
import { ServiceGraph } from './ServiceGraph';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
interface ServiceGraphWrapperProps {
  data: SpeedDataPoint[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const ServiceGraphWrapper: React.FC<ServiceGraphWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => datapoint.value !== null)) return <NoDataNotice isLineMetric />;
  const { average, peak } = getServiceWidgetValues(data, predictedData.counts);

  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          analysis={'Average'}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
          widgetValue={new TripsWidgetValue(average)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          sentimentDirection={'positiveOnIncrease'}
          analysis={`Peak - ${config.getWidgetTitle(peak.date)}`}
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

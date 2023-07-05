import React from 'react';
import type { SpeedByLine, SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { TripsWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getServiceWidgetValues } from './utils/utils';
import { ServiceHoursGraph } from './ServiceHoursGraph';
interface ServiceGraphWrapperProps {
  data: SpeedByLine[];
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
  if (!data.some((datapoint) => datapoint.miles_covered)) return <NoDataNotice isLineMetric />;
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
          widgetValue={new TripsWidgetValue(peak ? peak.count : undefined)}
        />
      </WidgetCarousel>
      <ServiceHoursGraph
        config={config}
        data={data}
        startDate={startDate}
        endDate={endDate}
        predictedData={predictedData}
      />
    </CarouselGraphDiv>
  );
};

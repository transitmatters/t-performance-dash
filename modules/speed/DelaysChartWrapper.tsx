import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getDetailsSpeedWidgetValues } from './utils/utils';
import type { ParamsType } from './constants/speeds';
import { DelaysChart } from './DelaysChart';

interface DelaysChartWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const DelaysChartWrapper: React.FC<DelaysChartWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  const dataNoNulls = data.filter((datapoint) => datapoint.miles_covered);
  if (dataNoNulls.length < 1) return <NoDataNotice isLineMetric />;
  const { current, delta, average, peak } = getDetailsSpeedWidgetValues(dataNoNulls);
  return (
    <CarouselGraphDiv>
      {/* <WidgetCarousel>
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
          widgetValue={new MPHWidgetValue(peak.mph, undefined)}
          analysis={`Peak (${config.getWidgetTitle(peak.date)})`}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </WidgetCarousel> */}
      <DelaysChart config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};

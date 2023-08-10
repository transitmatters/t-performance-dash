import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { TimePredictionWeek } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PredictionsGraph } from './PredictionsGraph';

interface PredictionsGraphWrapperProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
}

export const PredictionsGraphWrapper: React.FC<PredictionsGraphWrapperProps> = ({
  data,
  startDate,
  endDate,
}) => {
  if (data.length < 1) return <NoDataNotice isLineMetric />;
  // const { current, delta, average, peak } = getDetailsSpeedWidgetValues(dataNoNulls);
  return (
    <CarouselGraphDiv>
      {/* <WidgetCarousel> */}
      {/* TODO */}
      {/* <WidgetForCarousel
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
        /> */}
      {/* </WidgetCarousel> */}
      <PredictionsGraph data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};

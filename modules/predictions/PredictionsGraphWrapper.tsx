import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { TimePredictionWeek } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { PercentageWidgetValue } from '../../common/types/basicWidgets';
import { PredictionsGraph } from './PredictionsGraph';
import { getDetailsPredictiondWidgetValues } from './utils/utils';

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
  const { average } = getDetailsPredictiondWidgetValues(data);
  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          widgetValue={new PercentageWidgetValue(average)}
          analysis={'Average Accuracy'}
          sentimentDirection={'positiveOnIncrease'}
          layoutKind="no-delta"
        />
      </WidgetCarousel>
      <PredictionsGraph data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};

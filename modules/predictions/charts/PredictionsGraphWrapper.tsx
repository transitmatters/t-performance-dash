import React from 'react';
import { CarouselGraphDiv } from '../../../common/components/charts/CarouselGraphDiv';
import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { WidgetCarousel } from '../../../common/components/general/WidgetCarousel';
import { WidgetForCarousel } from '../../../common/components/widgets/internal/WidgetForCarousel';
import { PercentageWidgetValue } from '../../../common/types/basicWidgets';
import { prettyDate } from '../../../common/utils/date';
import { getDetailsPredictiondWidgetValues } from '../utils/utils';
import { WidgetTitle } from '../../dashboard/WidgetTitle';
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
  const { average, peak, worst } = getDetailsPredictiondWidgetValues(data);
  return (
    <>
      <WidgetTitle title="Arrival Predictions" />
      <CarouselGraphDiv>
        <WidgetCarousel>
          <WidgetForCarousel
            widgetValue={new PercentageWidgetValue(average)}
            analysis={'Average accuracy'}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
          <WidgetForCarousel
            widgetValue={
              new PercentageWidgetValue(peak.num_accurate_predictions / peak.num_predictions)
            }
            analysis={`Most accurate (${prettyDate(peak.weekly, false)})`}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
          <WidgetForCarousel
            widgetValue={
              new PercentageWidgetValue(worst.num_accurate_predictions / worst.num_predictions)
            }
            analysis={`Least accurate (${prettyDate(worst.weekly, false)})`}
            sentimentDirection={'positiveOnIncrease'}
            layoutKind="no-delta"
          />
        </WidgetCarousel>
        <PredictionsGraph data={data} startDate={startDate} endDate={endDate} />
      </CarouselGraphDiv>
    </>
  );
};

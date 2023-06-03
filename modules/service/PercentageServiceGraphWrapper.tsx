import React, { SetStateAction } from 'react';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { ParamsType } from '../speed/constants/speeds';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { PercentageWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { PercentageServiceGraph } from './PercentageServiceGraph';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { getPercentageData, getAverageWithNaNs } from './utils/utils';
import { useDelimitatedRoute } from '../../common/utils/router';

interface PercentageServiceGraphWrapperProps {
  data: SpeedDataPoint[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
  comparison: 'Scheduled' | 'Baseline';
  setComparison: React.Dispatch<SetStateAction<'Scheduled' | 'Baseline'>>;
}

export const PercentageServiceGraphWrapper: React.FC<PercentageServiceGraphWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  comparison,
  setComparison,
}) => {
  // TODO: Add 1 or 2 widgets to percentage service graph.
  const { line } = useDelimitatedRoute();

  const { scheduled, baseline } = getPercentageData(data, predictedData, line);
  const scheduledAverage = getAverageWithNaNs(scheduled);
  const baselineAverage = getAverageWithNaNs(baseline);
  return (
    <>
      <CarouselGraphDiv>
        <WidgetCarousel isSingleWidget>
          <WidgetForCarousel
            widgetValue={
              new PercentageWidgetValue(
                comparison == 'Scheduled' ? scheduledAverage : baselineAverage
              )
            }
            analysis={`Average`}
            layoutKind="no-delta"
            sentimentDirection={'positiveOnIncrease'}
          />
        </WidgetCarousel>
        <PercentageServiceGraph
          config={config}
          data={data}
          calculatedData={{ scheduled: scheduled, baseline: baseline }}
          startDate={startDate}
          endDate={endDate}
          comparison={comparison}
        />
      </CarouselGraphDiv>
      <div className={'flex w-full justify-center pt-2'}>
        <ButtonGroup
          options={Object.entries({ Scheduled: 'Scheduled', Baseline: 'Baseline' })}
          pressFunction={setComparison}
          additionalDivClass="md:w-auto"
          additionalButtonClass="md:w-fit"
        />
      </div>
    </>
  );
};

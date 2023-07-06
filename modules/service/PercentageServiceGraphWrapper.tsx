import React from 'react';
import type { SetStateAction } from 'react';
import type { SpeedByLine, TripCounts } from '../../common/types/dataPoints';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { PercentageWidgetValue } from '../../common/types/basicWidgets';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { ParamsType } from '../speed/constants/speeds';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PercentageServiceGraph } from './PercentageServiceGraph';
import { getPercentageData, getAverageWithNaNs } from './utils/utils';

interface PercentageServiceGraphWrapperProps {
  data: SpeedByLine[];
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
  if (!data.some((datapoint) => datapoint.miles_covered)) return <NoDataNotice isLineMetric />;

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
                comparison === 'Scheduled' ? scheduledAverage : baselineAverage
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

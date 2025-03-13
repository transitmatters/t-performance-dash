import React, { useMemo } from 'react';
import type { SetStateAction } from 'react';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
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
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
  comparison: 'Scheduled' | 'Historical Maximum';
  setComparison: React.Dispatch<SetStateAction<'Scheduled' | 'Historical Maximum'>>;
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

  const { scheduled, peak } = useMemo(
    () => getPercentageData(data, predictedData, line),
    [data, predictedData, line]
  );

  const { scheduledAverage, peakAverage } = useMemo(() => {
    const scheduledAverage = getAverageWithNaNs(scheduled);
    const peakAverage = getAverageWithNaNs(peak);
    return { scheduledAverage, peakAverage };
  }, [scheduled, peak]);

  if (!data.some((datapoint) => datapoint.miles_covered)) return <NoDataNotice isLineMetric />;

  return (
    <>
      <CarouselGraphDiv>
        <WidgetCarousel isSingleWidget>
          <WidgetForCarousel
            widgetValue={
              new PercentageWidgetValue(comparison === 'Scheduled' ? scheduledAverage : peakAverage)
            }
            analysis={`Average`}
            layoutKind="no-delta"
            sentimentDirection={'positiveOnIncrease'}
          />
        </WidgetCarousel>
        <PercentageServiceGraph
          config={config}
          data={data}
          calculatedData={{ scheduled: scheduled, peak: peak }}
          startDate={startDate}
          endDate={endDate}
          comparison={comparison}
        />
      </CarouselGraphDiv>
      <div className={'flex w-full justify-center pt-2'}>
        <ButtonGroup
          line={line}
          options={[
            ['Scheduled', 'Scheduled'],
            ['Historical Maximum', 'Historical Maximum'],
          ]}
          pressFunction={setComparison}
          additionalDivClass="md:w-auto"
          additionalButtonClass="md:w-fit"
        />
      </div>
    </>
  );
};

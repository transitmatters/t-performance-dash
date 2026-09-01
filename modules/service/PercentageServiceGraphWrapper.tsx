import React, { useMemo } from 'react';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { ParamsType } from '../speed/constants/speeds';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PercentageServiceGraph } from './PercentageServiceGraph';
import { getPercentageData } from './utils/utils';

interface PercentageServiceGraphWrapperProps {
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
  comparison: 'Scheduled' | 'Historical Maximum';
}

// The "% delivered" KPI now lives in the page's stat-card row (see ServiceDetails), so the chart
// no longer carries an in-plot carousel value — just the graph.
export const PercentageServiceGraphWrapper: React.FC<PercentageServiceGraphWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  comparison,
}) => {
  const { line } = useDelimitatedRoute();

  const { scheduled, peak } = useMemo(
    () => getPercentageData(data, predictedData, line),
    [data, predictedData, line]
  );

  if (!data.some((datapoint) => datapoint.miles_covered)) return <NoDataNotice isLineMetric />;

  return (
    <CarouselGraphDiv>
      <PercentageServiceGraph
        config={config}
        data={data}
        calculatedData={{ scheduled: scheduled, peak: peak }}
        startDate={startDate}
        endDate={endDate}
        comparison={comparison}
      />
    </CarouselGraphDiv>
  );
};

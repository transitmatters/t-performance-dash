import React from 'react';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { PredictionsGraph } from './PredictionsGraph';

interface PredictionsGraphWrapperProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
}

// The average/best/worst accuracy KPIs now live in the page's stat-card row (see
// PredictionsDetails), so the chart no longer carries an in-plot carousel value — just the graph.
export const PredictionsGraphWrapper: React.FC<PredictionsGraphWrapperProps> = ({
  data,
  startDate,
  endDate,
}) => {
  if (data.length < 1) return <NoDataNotice isLineMetric />;
  return (
    <ChartStack>
      <PredictionsGraph data={data} startDate={startDate} endDate={endDate} />
    </ChartStack>
  );
};

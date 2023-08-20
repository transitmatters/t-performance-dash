import React from 'react';
import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { WidgetTitle } from '../../dashboard/WidgetTitle';
import { PredictionsBinsGraph } from './PredictionsBinsGraph';

interface PredictionsBinsGraphWrapperProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
}

export const PredictionsBinsGraphWrapper: React.FC<PredictionsBinsGraphWrapperProps> = ({
  data,
  startDate,
  endDate,
}) => {
  if (data.length < 1) return <NoDataNotice isLineMetric />;
  return (
    <>
      <WidgetTitle title="Time Predictions by Bin" />
      <PredictionsBinsGraph data={data} startDate={startDate} endDate={endDate} />
    </>
  );
};

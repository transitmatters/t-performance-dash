import React from 'react';
import type { TimePredictionWeek } from '../../common/types/dataPoints';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { PredictionsBinsGraphWrapper } from './charts/PredictionsBinsGraphWrapper';

interface PredictionsDetailsWrapperProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
}

export const PredictionsDetailsWrapper: React.FC<PredictionsDetailsWrapperProps> = ({
  data,
  startDate,
  endDate,
}) => {
  return (
    <>
      <WidgetTitle title="Time Predictions" />
      <PredictionsBinsGraphWrapper data={data} startDate={startDate} endDate={endDate} />
    </>
  );
};

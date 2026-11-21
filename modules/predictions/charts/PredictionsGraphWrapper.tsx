import { ChartStack } from '../../../common/components/charts/ChartStack';
import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { PredictionsGraph } from './PredictionsGraph';

interface PredictionsGraphWrapperProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
}

export const PredictionsGraphWrapper = ({
  data,
  startDate,
  endDate,
}: PredictionsGraphWrapperProps) => {
  if (data.length < 1) return <NoDataNotice isLineMetric />;
  return (
    <ChartStack>
      <PredictionsGraph data={data} startDate={startDate} endDate={endDate} />
    </ChartStack>
  );
};

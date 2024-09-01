import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useRidershipDataLanding } from '../../../common/api/hooks/ridership';
import { OverallRidershipChart } from './OverallRidershipChart';

export const OverallRidershipChartWrapper: React.FC = () => {
  const ridershipData = useRidershipDataLanding();
  const ridershipDataReady =
    !ridershipData.isLoading && !ridershipData.isError && ridershipData.data;
  if (!ridershipDataReady) return <ChartPlaceHolder query={ridershipData} />;
  return <OverallRidershipChart ridershipData={ridershipData.data} />;
};

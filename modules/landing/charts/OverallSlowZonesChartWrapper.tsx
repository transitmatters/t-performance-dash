import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useSlowzoneDelayTotalData } from '../../../common/api/hooks/slowzones';
import { OverallSlowZonesChart } from './OverallSlowZonesChart';

export const OverallSlowZonesChartWrapper: React.FC = () => {
  const slowZoneData = useSlowzoneDelayTotalData();
  const dataReady = !slowZoneData.isLoading && !slowZoneData.isError && slowZoneData.data;
  if (!dataReady) return <ChartPlaceHolder query={slowZoneData} />;

  return <OverallSlowZonesChart data={slowZoneData.data.data} />;
};

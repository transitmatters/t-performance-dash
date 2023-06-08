import React from 'react';
import { useSpeedDataLanding } from '../../../common/api/hooks/speed';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { OverallSpeedChart } from './OverallSpeedChart';

export const OverallSpeedChartWrapper: React.FC = () => {
  const speedData = useSpeedDataLanding();
  const speedDataReady = speedData.some((query) => !query.isError && query.data);
  if (!speedDataReady) return <ChartPlaceHolder query={speedData[0]} />;
  const speedDataFiltered = speedData
    .map((query) => query.data)
    .filter((e): e is Exclude<typeof e, undefined> => e !== undefined);
  return <OverallSpeedChart speedData={speedDataFiltered} />;
};

import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useRidershipDataLanding } from '../../../common/api/hooks/ridership';
import type { Line } from '../../../common/types/lines';
import { LANDING_RAIL_LINES } from '../../../common/types/lines';
import type { RidershipCount } from '../../../common/types/dataPoints';
import { OverallRidershipChart } from './OverallRidershipChart';

export const OverallRidershipChartWrapper: React.FC = () => {
  const lines = LANDING_RAIL_LINES;
  const ridershipData = useRidershipDataLanding(lines);
  const ridershipDataReady = ridershipData.some((query) => !query.isError && query.data);
  if (!ridershipDataReady) return <ChartPlaceHolder query={ridershipData[0]} />;
  const ridershipDataFiltered = ridershipData
    .map((query, index) => {
      return { line: lines[index], data: query.data };
    })
    .filter(
      (e): e is Exclude<typeof e, { line: Line; data: undefined }> => e.data !== undefined
    ) as { line: Line; data: RidershipCount[] }[]; // Have to use `as` here.
  return <OverallRidershipChart ridershipData={ridershipDataFiltered} />;
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchActualTripsByLine } from '../../common/api/tripmetrics';
import { TODAY_STRING } from '../../common/constants/dates';
import { ONE_HOUR } from '../../common/constants/time';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
import { OverallServiceChartWrapper } from './charts/OverallServiceChartWrapper';
import { OverallRidershipChartWrapper } from './charts/OverallRidershipChartWrapper';
import { LandingChartWidget } from './LandingChartWidget';

export const LandingCharts: React.FC = () => {
  // This query is just to get the lambdas "warm"
  useQuery(
    ['primer'],
    () =>
      fetchActualTripsByLine({
        agg: 'daily',
        start_date: TODAY_STRING,
        end_date: TODAY_STRING,
        line: 'line-red',
      }),
    {
      staleTime: ONE_HOUR,
    }
  );
  return (
    <div className="flex flex-col items-center gap-8">
      <LandingChartWidget title="Speed">
        <OverallSpeedChartWrapper />
      </LandingChartWidget>
      <LandingChartWidget title="Service">
        <OverallServiceChartWrapper />
      </LandingChartWidget>
      <LandingChartWidget title="Ridership">
        <OverallRidershipChartWrapper />
      </LandingChartWidget>
    </div>
  );
};

import React from 'react';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { TODAY_STRING } from '../../common/constants/dates';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
import { OverallServiceChartWrapper } from './charts/OverallServiceChartWrapper';
import { OverallRidershipChartWrapper } from './charts/OverallRidershipChartWrapper';
import { OverallSlowZonesChartWrapper } from './charts/OverallSlowZonesChartWrapper';
import { OverallFleetAgeChartWrapper } from './charts/OverallFleetAgeChartWrapper';
import { LandingChartWidget } from './LandingChartWidget';
import { LineReportCard } from './LineReportCard';

export const LandingCharts: React.FC = () => {
  // This query is just to get the lambdas "warm"
  useDeliveredTripMetrics({
    agg: 'daily',
    start_date: TODAY_STRING,
    end_date: TODAY_STRING,
    line: 'line-red',
  });
  return (
    <div className="flex flex-col items-center gap-8 lg:gap-12">
      <LineReportCard />
      <div className="flex w-full max-w-5xl flex-col gap-4 px-4 md:px-8 lg:px-12">
        <h2 className="text-3xl font-thin text-stone-900 lg:text-4xl">Performance trends</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <LandingChartWidget title="Speed" compact>
            <OverallSpeedChartWrapper />
          </LandingChartWidget>
          <LandingChartWidget title="Service" compact>
            <OverallServiceChartWrapper />
          </LandingChartWidget>
          <LandingChartWidget title="Ridership" compact>
            <OverallRidershipChartWrapper />
          </LandingChartWidget>
          <LandingChartWidget title="Slow Zones" compact>
            <OverallSlowZonesChartWrapper />
          </LandingChartWidget>
          <LandingChartWidget title="Fleet Age" compact>
            <OverallFleetAgeChartWrapper />
          </LandingChartWidget>
        </div>
      </div>
    </div>
  );
};

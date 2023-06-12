import React from 'react';
import { LandingChartCopyMap } from '../../copy/landingCopy';
import type { LandingCharts } from './types';

interface LandingChartWidgetProps {
  title: LandingCharts;
  children: React.ReactNode;
}

export const LandingChartWidget: React.FC<LandingChartWidgetProps> = ({ title, children }) => {
  return (
    <div className="flex w-full flex-row justify-center gap-x-20 px-20">
      <div className="flex max-w-lg flex-shrink flex-col gap-y-4">
        <h2 className="text-7xl font-thin text-gray-400">{title}</h2>
        {LandingChartCopyMap[title]}
      </div>
      {children}
    </div>
  );
};

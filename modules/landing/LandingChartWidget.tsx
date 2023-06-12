import React from 'react';
import { LandingChartCopyMap } from '../../copy/landingCopy';
import type { LandingCharts } from './types';

interface LandingChartWidgetProps {
  title: LandingCharts;
  children: React.ReactNode;
}

export const LandingChartWidget: React.FC<LandingChartWidgetProps> = ({ title, children }) => {
  return (
    <div className="flex w-full flex-col justify-center gap-x-8 gap-y-4 px-4 md:px-8 lg:flex-row lg:gap-y-8 lg:px-12">
      <div className="shrink-1 flex max-w-md flex-col gap-y-2">
        <h2 className="text-7xl font-thin text-gray-400 lg:text-5xl xl:text-7xl">{title}</h2>
        {LandingChartCopyMap[title]}
      </div>
      {children}
    </div>
  );
};

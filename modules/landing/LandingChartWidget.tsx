import React from 'react';
import { LandingChartCopyMap } from '../../copy/landingCopy';
import type { LandingCharts } from './types';

interface LandingChartWidgetProps {
  title: LandingCharts;
  children: React.ReactNode;
}

export const LandingChartWidget: React.FC<LandingChartWidgetProps> = ({ title, children }) => {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-x-8 gap-y-4 px-4 md:px-8  lg:items-center lg:gap-y-8 lg:px-12">
      <h2 className="w-full text-7xl font-thin text-stone-900 lg:text-5xl xl:text-7xl">{title}</h2>
      <div className="flex w-full flex-col gap-x-8 gap-y-4 lg:flex-row lg:gap-y-8">
        <div className="flex flex-initial flex-col gap-y-2 lg:w-[84rem]">{children}</div>
        <div className="flex w-full min-w-[200px] max-w-md flex-initial shrink flex-col gap-y-2">
          {LandingChartCopyMap[title]}
        </div>
      </div>
    </div>
  );
};

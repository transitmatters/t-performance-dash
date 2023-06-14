import React from 'react';

interface LandingChartWidgetProps {
  title: string;
  children: React.ReactNode;
}

export const LandingChartWidget: React.FC<LandingChartWidgetProps> = ({ title, children }) => {
  return (
    <div className="flex w-full flex-col justify-center gap-y-4 px-4 md:px-8 lg:flex-row lg:gap-x-12 lg:px-20 xl:gap-x-20">
      <div className="flex max-w-lg flex-shrink flex-col gap-y-2">
        <h2 className="truncate text-7xl font-thin text-stone-400 lg:text-5xl xl:text-7xl">
          {title}
        </h2>
        <p className="text-stone-100">
          Explanation of how we calculate speed. Speed is important to riders because of X, Y, and
          Z. The baseline is DATE RANGE.
        </p>
      </div>
      {children}
    </div>
  );
};

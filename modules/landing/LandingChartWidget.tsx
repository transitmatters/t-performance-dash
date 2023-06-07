import React from 'react';

interface LandingChartWidgetProps {
  title: string;
  children: React.ReactNode;
}

export const LandingChartWidget: React.FC<LandingChartWidgetProps> = ({ title, children }) => {
  return (
    <div className="flex w-full flex-row justify-center gap-x-20 px-20">
      <div className="flex max-w-lg flex-shrink flex-col gap-y-4">
        <h2 className="text-7xl font-thin text-gray-400">{title}</h2>
        <p className="text-gray-100">
          Explanation of how we calculate speed. Speed is important to riders because of X, Y, and
          Z. The baseline is DATE RANGE.
        </p>
      </div>
      {children}
    </div>
  );
};

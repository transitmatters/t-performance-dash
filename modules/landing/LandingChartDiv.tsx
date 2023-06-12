import React from 'react';
interface LandingChartDivProps {
  children: React.ReactElement[];
}
export const LandingChartDiv: React.FC<LandingChartDivProps> = ({ children }) => {
  return (
    <div className="flex h-fit w-full max-w-lg shrink-0 flex-col gap-y-1 rounded-md bg-gray-500 px-4 py-2 lg:max-w-sm xl:max-w-lg">
      {children}
    </div>
  );
};

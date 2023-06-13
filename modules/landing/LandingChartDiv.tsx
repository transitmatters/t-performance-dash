import React from 'react';
interface LandingChartDivProps {
  children: React.ReactElement;
}
export const LandingChartDiv: React.FC<LandingChartDivProps> = ({ children }) => {
  return (
    <div className="h-[240px] w-full max-w-xl rounded-md bg-gray-500 px-4 py-2">{children}</div>
  );
};

import React from 'react';

interface ChartPageDivProps {
  children: React.ReactNode;
}

export const ChartPageDiv: React.FC<ChartPageDivProps> = ({ children }) => {
  return <div className="flex w-full max-w-7xl flex-col gap-4 md:gap-8">{children}</div>;
};

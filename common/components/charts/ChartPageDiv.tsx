import React from 'react';

interface ChartPageDivProps {
  children: React.ReactNode;
}

export const ChartPageDiv: React.FC<ChartPageDivProps> = ({ children }) => {
  return <div className="flex w-full flex-col gap-6 md:gap-8">{children}</div>;
};

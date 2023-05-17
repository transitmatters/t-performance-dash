import React from 'react';
interface ChartDivProps {
  children: React.ReactNode;
}

export const ChartDiv: React.FC<ChartDivProps> = ({ children }) => {
  return <div className="flex h-60 w-full flex-row">{children}</div>;
};

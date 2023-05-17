import React from 'react';

interface ChartBorderProps {
  children: React.ReactNode;
}

export const ChartBorder: React.FC<ChartBorderProps> = ({ children }) => {
  return (
    <div className="relative flex w-full flex-col rounded-md border border-stone-100 bg-white p-2 shadow-sm">
      {children}
    </div>
  );
};

import React from 'react';

interface ChartBorderProps {
  children: React.ReactNode;
}

export const ChartBorder: React.FC<ChartBorderProps> = ({ children }) => {
  return (
    <div className="relative flex w-full flex-col rounded-md border-stone-100 bg-white lg:border lg:p-2 lg:shadow-sm">
      {children}
    </div>
  );
};

import React from 'react';
interface DatapointWidgetPairProps {
  children: React.ReactNode;
}

export const DatapointWidgetPair: React.FC<DatapointWidgetPairProps> = ({ children }) => {
  return (
    <div className="flex flex-row items-start justify-around rounded-md border border-stone-100 bg-white px-2 shadow-sm md:flex-col">
      {children}
    </div>
  );
};

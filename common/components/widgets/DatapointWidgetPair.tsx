import React from 'react';
interface DatapointWidgetPairProps {
  children: React.ReactNode;
}

export const DatapointWidgetPair: React.FC<DatapointWidgetPairProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-around rounded-md px-4 lg:flex-col lg:items-start">
      {children}
    </div>
  );
};

import React from 'react';
import { BigDelta } from './BigDelta';

const getDescription = (value: number) => {
  if (value >= 0 || !value) {
    return 'Faster';
  }
  return 'Slower';
};

interface CompWidgetProps {
  value: number;
  text: React.ReactNode;
}

export const CompWidget: React.FC<CompWidgetProps> = ({ value, text }) => {
  return (
    <div className="flex w-full flex-row items-baseline rounded-md border-black border-opacity-30 bg-black bg-opacity-[15%] px-4 py-2">
      <div className="flex flex-col gap-y-1 text-white text-opacity-95">
        <div className="flex flex-row items-baseline">
          <BigDelta delta={value} sentimentDirection="positiveOnIncrease" />
          <p className="pl-1 text-xl italic">{getDescription(value)}</p>
        </div>
        {text}
      </div>
    </div>
  );
};

import React from 'react';
import { BigDelta } from '../../../common/components/widgets/internal/BigDelta';

const getDescription = (value) => {
  if (Math.abs(value) < 1) return 'Change';
  if (value > 0) {
    return 'Faster';
  }
  return 'Slower';
};

interface CompWidgetProps {
  value: number;
  text: React.ReactNode;
  info: string;
}

export const CompWidget: React.FC<CompWidgetProps> = ({ value, text, info }) => {
  return (
    <div className="flex w-full flex-row items-baseline rounded-md border-black border-opacity-30 bg-black bg-opacity-20 px-4 py-2">
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

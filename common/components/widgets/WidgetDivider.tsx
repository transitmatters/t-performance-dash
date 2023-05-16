import React from 'react';

interface WidgetDividerProps {
  isVertical: boolean;
}

export const WidgetDivider: React.FC<WidgetDividerProps> = ({ isVertical }) => {
  if (isVertical) {
    return <hr className="h-16 w-[1px] bg-stone-200" />;
  }
  return <hr className="h-[1px] w-full bg-stone-200" />;
};

import React from 'react';

interface CarouselGraphDivProps {
  children: React.ReactNode;
}

export const CarouselGraphDiv: React.FC<CarouselGraphDivProps> = ({ children }) => {
  return <div className="flex flex-col gap-y-1 pt-2 ">{children}</div>;
};

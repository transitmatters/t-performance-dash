import React from 'react';

interface ChartStackProps {
  children: React.ReactNode;
}

/** Stacks a chart with its button/legend row. No card surface of its own — it always lives inside a Widget. */
export const ChartStack: React.FC<ChartStackProps> = ({ children }) => {
  return <div className="relative flex w-full flex-col gap-y-2">{children}</div>;
};

import classNames from 'classnames';
import React from 'react';

interface ChartStackProps {
  children: React.ReactNode;
  className?: string;
}

/** Stacks a chart with its button/legend row. No card surface of its own — it always lives inside a Widget. */
export const ChartStack: React.FC<ChartStackProps> = ({ children, className }) => {
  return (
    <div className={classNames('relative flex w-full flex-col gap-y-2', className)}>{children}</div>
  );
};

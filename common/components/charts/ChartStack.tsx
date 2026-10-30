import classNames from 'classnames';
import type { ReactNode } from 'react';

interface ChartStackProps {
  children: ReactNode;
  className?: string;
}

/** Stacks a chart with its button/legend row. No card surface of its own — it always lives inside a Widget. */
export const ChartStack = ({ children, className }: ChartStackProps) => {
  return (
    <div className={classNames('relative flex w-full flex-col gap-y-2', className)}>{children}</div>
  );
};

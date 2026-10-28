import classNames from 'classnames';
import type { ReactNode } from 'react';

interface ChartDivProps {
  children: ReactNode;
  isMobile?: boolean;
  /** Take the parent's height instead of a fixed one. */
  fill?: boolean;
}

export const ChartDiv = ({ children, isMobile = false, fill = false }: ChartDivProps) => {
  const height = fill ? 'min-h-0 flex-1' : isMobile ? 'h-48' : 'h-60';
  return <div className={classNames(height, 'flex w-full flex-row')}>{children}</div>;
};

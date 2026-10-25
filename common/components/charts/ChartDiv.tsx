import classNames from 'classnames';
import React from 'react';

interface ChartDivProps {
  children: React.ReactNode;
  isMobile?: boolean;
  /** Take the parent's height instead of a fixed one. */
  fill?: boolean;
}

export const ChartDiv: React.FC<ChartDivProps> = ({ children, isMobile = false, fill = false }) => {
  const height = fill ? 'min-h-0 flex-1' : isMobile ? 'h-48' : 'h-60';
  return <div className={classNames(height, 'flex w-full flex-row')}>{children}</div>;
};

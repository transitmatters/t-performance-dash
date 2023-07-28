import classNames from 'classnames';
import React from 'react';
interface ChartDivProps {
  children: React.ReactNode;
  isMobile?: boolean;
}

export const ChartDiv: React.FC<ChartDivProps> = ({ children, isMobile = false }) => {
  return (
    <div className={classNames(isMobile ? 'h-50' : 'h-60', 'flex w-full flex-row')}>{children}</div>
  );
};

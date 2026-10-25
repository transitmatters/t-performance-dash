import classNames from 'classnames';
import type { ReactNode } from 'react';

interface ChartDivProps {
  children: ReactNode;
  isMobile?: boolean;
}

export const ChartDiv = ({ children, isMobile = false }: ChartDivProps) => {
  return (
    <div className={classNames(isMobile ? 'h-48' : 'h-60', 'flex w-full flex-row')}>{children}</div>
  );
};

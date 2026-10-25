import classNames from 'classnames';
import type { FC, ReactNode } from 'react';

interface ChartDivProps {
  children: ReactNode;
  isMobile?: boolean;
}

export const ChartDiv: FC<ChartDivProps> = ({ children, isMobile = false }) => {
  return (
    <div className={classNames(isMobile ? 'h-48' : 'h-60', 'flex w-full flex-row')}>{children}</div>
  );
};

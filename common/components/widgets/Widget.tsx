import classNames from 'classnames';
import React from 'react';
import { BusDataNotice } from '../notices/BusDataNotice';

interface WidgetPageProps {
  children?: React.ReactNode;
}

export const WidgetPage: React.FC<WidgetPageProps> = ({ children }) => {
  return (
    <div className={classNames('flex w-full flex-1 flex-col gap-y-2 lg:p-0')}>
      {children}
      <BusDataNotice />
    </div>
  );
};

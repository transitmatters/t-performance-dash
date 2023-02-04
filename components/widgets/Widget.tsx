import React from 'react';
import { classNames } from '../utils/tailwind';

export const WidgetPage = ({ children }) => {
  return (
    <div className={classNames('flex w-full flex-1 flex-col gap-y-2 pb-28 lg:p-0')}>{children}</div>
  );
};

import classNames from 'classnames';
import React from 'react';

export const WidgetPage = ({ children }) => {
  return (
    <div className={classNames('flex w-full flex-1 flex-col gap-y-2 pb-28 lg:p-0')}>{children}</div>
  );
};

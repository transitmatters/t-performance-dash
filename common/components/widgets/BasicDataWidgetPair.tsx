import classNames from 'classnames';
import React from 'react';

export const BasicDataWidgetPair = ({ children }) => {
  return <div className={classNames('flex flex-row gap-x-2')}>{children}</div>;
};

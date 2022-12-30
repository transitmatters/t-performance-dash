import React from 'react';
import { classNames } from '../utils/tailwind';

export const BasicDataWidgetPair = ({ children }) => {
  return <div className={classNames('flex flex-row gap-x-2')}>{children}</div>;
};

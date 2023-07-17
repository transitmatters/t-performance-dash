import classNames from 'classnames';
import React from 'react';

interface BasicDataWidgetPairProps {
  children?: React.ReactNode;
}

export const BasicDataWidgetPair: React.FC<BasicDataWidgetPairProps> = ({ children }) => {
  return <div className={classNames('flex flex-row gap-x-2')}>{children}</div>;
};

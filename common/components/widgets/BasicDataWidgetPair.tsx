import classNames from 'classnames';
import type { ReactNode } from 'react';

interface BasicDataWidgetPairProps {
  children?: ReactNode;
}

export const BasicDataWidgetPair = ({ children }: BasicDataWidgetPairProps) => {
  return <div className={classNames('flex flex-row gap-x-2')}>{children}</div>;
};

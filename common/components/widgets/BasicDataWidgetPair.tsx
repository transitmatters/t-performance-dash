import classNames from 'classnames';
import type { FC, ReactNode } from 'react';

interface BasicDataWidgetPairProps {
  children?: ReactNode;
}

export const BasicDataWidgetPair: FC<BasicDataWidgetPairProps> = ({ children }) => {
  return <div className={classNames('flex flex-row gap-x-2')}>{children}</div>;
};

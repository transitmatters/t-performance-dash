import classNames from 'classnames';
import type { ReactNode } from 'react';

interface WidgetPageProps {
  children?: ReactNode;
}

export const WidgetPage = ({ children }: WidgetPageProps) => {
  return (
    <div className={classNames('flex w-full flex-1 flex-col items-center gap-y-2 lg:p-0')}>
      {children}
    </div>
  );
};

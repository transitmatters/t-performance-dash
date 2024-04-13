import classNames from 'classnames';
import React from 'react';

interface WidgetDivProps {
  children: React.ReactNode;
  className?: string;
}

export const WidgetDiv: React.FC<WidgetDivProps> = ({ children, className }) => {
  return (
    <div className={classNames(className, 'h-full rounded-lg bg-white p-3 shadow-dataBox sm:p-4')}>
      {children}
    </div>
  );
};

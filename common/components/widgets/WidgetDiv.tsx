import classNames from 'classnames';
import React from 'react';

interface WidgetDivProps {
  children: React.ReactNode;
  className?: string;
}

export const WidgetDiv: React.FC<WidgetDivProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(
        className,
        'bg-card text-card-foreground ring-foreground/10 h-full rounded-xl p-3 ring-1 sm:p-4'
      )}
    >
      {children}
    </div>
  );
};

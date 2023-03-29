import React from 'react';
import classNames from 'classnames';

interface WidgetWrapperProps {
  children: React.ReactNode;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ children }) => {
  return (
    <div
      className={classNames(
        'w-1/2 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox sm:w-auto sm:p-4'
      )}
    >
      {children}
    </div>
  );
};

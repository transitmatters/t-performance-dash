import React from 'react';
import classNames from 'classnames';

interface WidgetTitle {
  title: string;
}
export const WidgetTitle: React.FC<WidgetTitle> = ({ title }) => {
  return (
    <div className="flex w-full flex-row items-center p-2 text-xl">
      <h3 className={classNames('font-semibold', 'text-gray-800')}>{title}</h3>
    </div>
  );
};

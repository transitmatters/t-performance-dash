import React from 'react';
import classNames from 'classnames';
import type { BasicWidgetDataLayoutProps } from './internal/BasicWidgetDataLayout';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';

export const BasicDataWidgetItem: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis,
  widgetValue,
  sentimentDirection,
}) => {
  return (
    <div className={classNames('w-1/2 rounded-lg bg-white p-2 shadow-dataBox sm:w-auto sm:p-4')}>
      <BasicWidgetDataLayout
        title={title}
        analysis={analysis}
        widgetValue={widgetValue}
        sentimentDirection={sentimentDirection}
      />
    </div>
  );
};

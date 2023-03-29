import React from 'react';
import classNames from 'classnames';
import type { BasicWidgetDataLayoutProps } from './internal/BasicWidgetDataLayout';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { WidgetDataLayoutNoComparison } from './internal/WidgetDataLayoutNoComparison';

export const BasicDataWidgetItem: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis,
  widgetValue,
  sentimentDirection,
  comparison = true,
}) => {
  return (
    <div
      className={classNames(
        'w-1/2 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox sm:w-auto sm:p-4'
      )}
    >
      {comparison ? (
        <BasicWidgetDataLayout
          title={title}
          analysis={analysis}
          widgetValue={widgetValue}
          sentimentDirection={sentimentDirection}
        />
      ) : (
        <WidgetDataLayoutNoComparison
          title={title}
          analysis={analysis}
          widgetValue={widgetValue}
          sentimentDirection={sentimentDirection}
        />
      )}
    </div>
  );
};

import React from 'react';
import classNames from 'classnames';
import type { BasicWidgetDataLayoutProps } from './internal/BasicWidgetDataLayout';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';

export const BasicDataWidgetItem: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  value,
  analysis,
  delta,
  unit,
  sentiment,
}) => {
  return (
    <div
      className={classNames(
        'w-1/2 rounded-lg border-design-lightGrey bg-white p-6 py-4 shadow-dataBox sm:w-auto'
      )}
    >
      <BasicWidgetDataLayout
        title={title}
        value={value}
        analysis={analysis}
        delta={delta}
        unit={unit}
        sentiment={sentiment}
      />
    </div>
  );
};

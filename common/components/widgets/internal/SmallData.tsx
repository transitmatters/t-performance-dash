import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';

type SmallDataProps = {
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
};

export const SmallData: React.FC<SmallDataProps> = ({ analysis, widgetValue }) => {
  return (
    <div className="flex flex-row items-end justify-between">
      <p className={classNames('text-design-subtitleGrey truncate text-sm leading-tight')}>
        {analysis}
      </p>
      <div className="flex flex-row items-baseline gap-x-1">{widgetValue.getFormattedValue()}</div>
    </div>
  );
};

import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';

export type LayoutKind = 'total-and-delta' | 'delta-and-percent-change' | 'no-delta';
export type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

export type WidgetNoDeltaProps = {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  widgetValue: WidgetValueInterface;
};

export const WidgetNoDelta: React.FC<WidgetNoDeltaProps> = ({ title, subtitle, widgetValue }) => {
  return (
    <>
      <div className={classNames('relative flex bg-white')}>
        {widgetValue.value === undefined && <LoadingSpinner isWidget />}
        <div className={classNames('flex flex-col items-start p-2')}>
          <p className={classNames('text-sm text-gray-500')}>{title}</p>
          <div className="flex flex-row items-baseline gap-x-1">
            <p className={classNames('text-xl font-semibold text-gray-900 ')}>
              {widgetValue.getFormattedValue()}
            </p>
            <p className="text-sm text-design-subtitleGrey">{widgetValue.getUnits()}</p>
          </div>
          <div className="mt-1 flex flex-row items-baseline gap-x-1">
            <p className={classNames('truncate text-xs text-design-subtitleGrey sm:text-sm')}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

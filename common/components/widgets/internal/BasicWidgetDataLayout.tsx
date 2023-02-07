import React from 'react';
import classNames from 'classnames';
import { WidgetUnit, WIDGET_UNITS } from '../../../types/basicWidgets';

export type BasicWidgetDataLayoutProps = {
  title: string;
  value: number;
  analysis: string;
  delta?: number;
  unit: WidgetUnit;
  // If sentiment is true -> increase in stat = negative sentiment.
  sentiment?: boolean;
};

export const BasicWidgetDataLayout: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  value,
  analysis,
  delta,
  unit,
  sentiment = true,
}) => {
  const getDelta = (delta: number) => {
    const deltaValue = WIDGET_UNITS[unit].format(delta);
    const positive = delta > 0;
    const positiveSentiment = (!positive && sentiment) || (positive && !sentiment);
    const deltaSymbol = positive ? '+' : '-';
    return (
      <div
        className={classNames(
          'mt-1 flex flex-row rounded-full  px-3',
          positiveSentiment ? 'bg-green-100' : 'bg-red-100'
        )}
      >
        <p
          className={classNames(
            'text-sm',
            positiveSentiment ? 'text-sm text-green-800' : 'text-red-800'
          )}
        >
          {`${deltaSymbol}${deltaValue}`}
        </p>
      </div>
    );
  };
  return (
    <div className={classNames('bg-white p-2')}>
      <div className={classNames('flex flex-col items-start')}>
        <p className={classNames('text-base text-gray-500')}>{title}</p>
        <div className="flex flex-row items-baseline gap-x-1">
          <p className={classNames('text-4xl font-semibold text-gray-900 sm:text-3xl')}>
            {WIDGET_UNITS[unit].format(value)}
          </p>
          <p className="text-base text-design-subtitleGrey">{WIDGET_UNITS[unit].description}</p>
        </div>
        <div className="flex flex-row items-baseline gap-x-1">
          {delta && getDelta(delta)}

          <p className={classNames('text-sm text-design-subtitleGrey')}>{analysis}</p>
        </div>
      </div>
    </div>
  );
};

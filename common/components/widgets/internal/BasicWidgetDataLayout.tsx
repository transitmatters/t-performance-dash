import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { Delta } from './Delta';

export type LayoutKind = 'total-and-delta' | 'delta-and-percent-change' | 'no-delta';
export type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

export type BasicWidgetDataLayoutProps = {
  title: React.ReactNode;
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
  layoutKind?: LayoutKind;
  isLarge?: boolean;
};

export const BasicWidgetDataLayout: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis: analysis,
  widgetValue,
  layoutKind = 'total-and-delta',
  sentimentDirection = 'negativeOnIncrease',
  isLarge = true,
}) => {
  const getPrimaryValue = () => {
    const useDelta = layoutKind === 'delta-and-percent-change';
    if (useDelta) {
      return widgetValue.getFormattedDelta(false);
    }
    return widgetValue.getFormattedValue();
  };

  return (
    <>
      <div className={classNames('relative flex')}>
        {widgetValue.value === undefined && <LoadingSpinner isWidget />}
        <div className={classNames('flex flex-col items-start p-2')}>
          <p className={classNames('text-base text-gray-500', isLarge ? 'text-base' : 'text-sm')}>
            {title}
          </p>
          <div className="flex flex-row items-baseline gap-x-1">
            <p
              className={classNames(
                'font-semibold text-gray-900',
                isLarge ? 'text-2xl' : 'text-xl'
              )}
            >
              {getPrimaryValue()}
            </p>
            <p
              className={classNames(isLarge ? 'text-base' : 'text-sm', 'text-design-subtitleGrey')}
            >
              {widgetValue.getUnits()}
            </p>
          </div>
          <div className="mt-1 flex flex-row items-baseline gap-x-1">
            {layoutKind !== 'no-delta' && (
              <Delta
                widgetValue={widgetValue}
                sentimentDirection={sentimentDirection}
                usePercentChange={layoutKind === 'delta-and-percent-change'}
              />
            )}
            <p className={classNames('truncate text-xs text-design-subtitleGrey sm:text-sm')}>
              {analysis}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

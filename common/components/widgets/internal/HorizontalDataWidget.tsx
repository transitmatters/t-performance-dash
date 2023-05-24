import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { Delta } from './Delta';

export type LayoutKind = 'total-and-delta' | 'delta-and-percent-change' | 'no-delta';
export type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

export type HorizontalDataWidgetProps = {
  title: React.ReactNode;
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
  layoutKind?: LayoutKind;
  isLarge?: boolean;
};

export const HorizontalDataWidget: React.FC<HorizontalDataWidgetProps> = ({
  analysis: analysis,
  widgetValue,
  layoutKind = 'total-and-delta',
  sentimentDirection = 'negativeOnIncrease',
  isLarge = true,
}) => {
  return (
    <div className={classNames('relative flex w-full')}>
      {widgetValue.value === undefined && <LoadingSpinner isWidget />}
      <div
        className={classNames(
          'flex flex-row items-baseline justify-between rounded-lg border border-stone-100 px-2 py-1'
        )}
      >
        <div className="flex flex-row items-baseline justify-end gap-4">
          <div className="flex flex-row items-baseline gap-x-1">
            <p
              className={classNames(
                'font-semibold text-gray-900',
                isLarge ? 'text-2xl' : 'text-xl'
              )}
            >
              {widgetValue.getFormattedValue()}
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
    </div>
  );
};

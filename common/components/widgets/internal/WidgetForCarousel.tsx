import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { Delta } from './Delta';

export type LayoutKind = 'total-and-delta' | 'delta-and-percent-change' | 'no-delta';
export type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

export type WidgetForCarouselProps = {
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
  layoutKind?: LayoutKind;
};

export const WidgetForCarousel: React.FC<WidgetForCarouselProps> = ({
  analysis,
  widgetValue,
  layoutKind = 'total-and-delta',
  sentimentDirection = 'negativeOnIncrease',
}) => {
  const isHorizontal = !useBreakpoint('lg');

  if (isHorizontal)
    return (
      <div className={classNames('relative flex w-full')}>
        {widgetValue.value === undefined && <LoadingSpinner isWidget />}
        <div className={classNames('flex flex-row items-baseline justify-between rounded-lg px-2')}>
          <div className="flex flex-row items-baseline justify-end gap-4">
            <div className="flex flex-row items-baseline gap-x-1">
              {widgetValue.getFormattedValue()}
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
  return (
    <div className="">
      <div className={classNames('relative flex')}>
        {widgetValue.value === undefined && <LoadingSpinner isWidget />}
        <div className={classNames('flex flex-col items-start')}>
          <div className="flex flex-row items-baseline gap-x-1">
            {widgetValue.getFormattedValue()}
          </div>
          <div className="flex flex-row items-baseline gap-x-1 ">
            {layoutKind !== 'no-delta' && (
              <Delta
                widgetValue={widgetValue}
                sentimentDirection={sentimentDirection}
                usePercentChange={layoutKind === 'delta-and-percent-change'}
              />
            )}
            <p
              className={classNames(
                'truncate text-xs leading-tight text-design-subtitleGrey sm:text-sm'
              )}
            >
              {analysis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

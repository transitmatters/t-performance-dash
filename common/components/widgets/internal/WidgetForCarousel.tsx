import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { Delta } from './Delta';

type LayoutKind = 'total-and-delta' | 'delta-and-percent-change' | 'no-delta';
type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

type WidgetForCarouselProps = {
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
  return (
    <div className="">
      <div className={classNames('relative flex')}>
        {widgetValue.value === undefined && <LoadingSpinner isWidget />}
        <div className={classNames('flex flex-col items-start')}>
          <div className="flex flex-row items-baseline gap-x-1">
            {widgetValue.getFormattedValue(true)}
          </div>
          <div className="flex flex-row items-baseline gap-x-1">
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

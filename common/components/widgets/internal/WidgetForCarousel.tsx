import type { ReactNode } from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { Delta } from './Delta';

type LayoutKind = 'total-and-delta' | 'delta-and-percent-change' | 'no-delta';
type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

type WidgetForCarouselProps = {
  analysis: ReactNode;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
  layoutKind?: LayoutKind;
};

export const WidgetForCarousel = ({
  analysis,
  widgetValue,
  layoutKind = 'total-and-delta',
  sentimentDirection = 'negativeOnIncrease',
}: WidgetForCarouselProps) => {
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
                'text-design-subtitleGrey truncate text-xs leading-tight sm:text-sm'
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

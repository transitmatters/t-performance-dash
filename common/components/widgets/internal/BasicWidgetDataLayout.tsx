import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';

type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

export type BasicWidgetDataLayoutProps = {
  title: string;
  analysis: string;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
};

export const BasicWidgetDataLayout: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis,
  widgetValue,
  sentimentDirection = 'negativeOnIncrease',
}) => {
  const getDelta = () => {
    const deltaValue = widgetValue.getFormattedDelta();
    const increase = widgetValue.delta ? widgetValue.delta > 0 : false;
    const positiveSentiment =
      (!increase && sentimentDirection === 'negativeOnIncrease') ||
      (increase && sentimentDirection === 'positiveOnIncrease');
    const bgColor = positiveSentiment ? 'bg-green-100' : 'bg-red-100';
    const textColor = positiveSentiment ? 'text-green-800' : 'text-red-800';
    return (
      <div
        className={classNames(
          'mt-1 flex flex-row rounded-full px-2',
          widgetValue.delta ? bgColor : 'bg-gray-100'
        )}
      >
        <p
          className={classNames(
            'text-xs sm:text-sm',
            widgetValue.delta ? textColor : 'text-rb-800'
          )}
        >
          {deltaValue}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className={classNames('flex flex-1  bg-white')}>
        {widgetValue.value === undefined && <LoadingSpinner />}
        <div className={classNames('flex flex-col items-start p-2')}>
          <p className={classNames('text-base text-gray-500')}>{title}</p>
          <div className="flex flex-row items-baseline gap-x-1">
            <p className={classNames('text-3xl font-semibold text-gray-900 ')}>
              {widgetValue.getFormattedValue()}
            </p>
            <p className="text-base text-design-subtitleGrey">{widgetValue.getUnits()}</p>
          </div>
          <div className="flex flex-row items-baseline gap-x-1">
            {getDelta()}
            <p className={classNames('text-xs text-design-subtitleGrey sm:text-sm')}>{analysis}</p>
          </div>
        </div>
      </div>
    </>
  );
};

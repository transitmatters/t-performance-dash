import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';

type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';
type LayoutKind = 'total-and-delta' | 'delta-and-percent-change';

export type BasicWidgetDataLayoutProps = {
  title: React.ReactNode;
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
  layoutKind?: LayoutKind;
};

export const BasicWidgetDataLayout: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis,
  widgetValue,
  layoutKind = 'total-and-delta',
  sentimentDirection = 'negativeOnIncrease',
}) => {
  const getPrimaryValue = () => {
    const useDelta = layoutKind === 'delta-and-percent-change';
    if (useDelta) {
      return widgetValue.getFormattedDelta();
    }
    return widgetValue.getFormattedValue();
  };

  const getSecondaryValue = () => {
    const useDelta = layoutKind === 'total-and-delta';
    const changingValue = useDelta ? widgetValue.delta : widgetValue.percentChange;
    const formattedChangingValue = useDelta
      ? widgetValue.getFormattedDelta()
      : widgetValue.getFormattedPercentChange();
    const increase = changingValue ? changingValue > 0 : false;
    const positiveSentiment =
      (!increase && sentimentDirection === 'negativeOnIncrease') ||
      (increase && sentimentDirection === 'positiveOnIncrease');
    const bgColor = positiveSentiment ? 'bg-green-100' : 'bg-red-100';
    const textColor = positiveSentiment ? 'text-green-800' : 'text-red-800';
    return (
      <div
        className={classNames(
          'mt-1 flex flex-row rounded-full px-2',
          changingValue ? bgColor : 'bg-gray-100'
        )}
      >
        <p className={classNames('text-xs sm:text-sm', changingValue ? textColor : 'text-rb-800')}>
          {formattedChangingValue}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className={classNames('relative flex  flex-1 bg-white')}>
        {widgetValue.value === undefined && <LoadingSpinner />}
        <div className={classNames('flex flex-col items-start p-2')}>
          <p className={classNames('text-base text-gray-500')}>{title}</p>
          <div className="flex flex-row items-baseline gap-x-1">
            <p className={classNames('text-3xl font-semibold text-gray-900 ')}>
              {getPrimaryValue()}
            </p>
            <p className="text-base text-design-subtitleGrey">{widgetValue.getUnits()}</p>
          </div>
          <div className="flex flex-row items-baseline gap-x-1">
            {getSecondaryValue()}
            <p className={classNames('text-xs text-design-subtitleGrey sm:text-sm')}>{analysis}</p>
          </div>
        </div>
      </div>
    </>
  );
};

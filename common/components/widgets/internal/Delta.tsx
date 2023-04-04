import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import type { SentimentDirection } from './BasicWidgetDataLayout';

interface DeltaProps {
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
}

export const Delta: React.FC<DeltaProps> = ({
  widgetValue,
  sentimentDirection = 'negativeOnIncrease',
}) => {
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
        'flex flex-row rounded-full px-2',
        widgetValue.delta ? bgColor : 'bg-gray-100'
      )}
    >
      <p
        className={classNames('text-xs sm:text-sm', widgetValue.delta ? textColor : 'text-rb-800')}
      >
        {deltaValue}
      </p>
    </div>
  );
};

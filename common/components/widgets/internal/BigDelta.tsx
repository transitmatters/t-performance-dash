import React from 'react';
import classNames from 'classnames';
import type { SentimentDirection } from './BasicWidgetDataLayout';

interface BigDeltaProps {
  delta: number;
  sentimentDirection?: SentimentDirection;
}

export const BigDelta: React.FC<BigDeltaProps> = ({
  delta,
  sentimentDirection = 'negativeOnIncrease',
}) => {
  const increase = delta ? delta > 0 : false;
  const positiveSentiment =
    (!increase && sentimentDirection === 'negativeOnIncrease') ||
    (increase && sentimentDirection === 'positiveOnIncrease');
  const bgColor = positiveSentiment ? 'bg-green-200 border-green-600' : 'bg-red-200 border-red-600';
  const textColor = positiveSentiment ? 'text-green-600' : 'text-red-600';
  return (
    <div
      className={classNames(
        'flex flex-row rounded-full border px-4',
        delta ? bgColor : 'bg-gray-200'
      )}
    >
      <p className={classNames('sm:xl text-2xl', delta ? textColor : 'text-rb-600')}>
        {isNaN(delta) ? '...' : Math.abs(delta)}%
      </p>
    </div>
  );
};

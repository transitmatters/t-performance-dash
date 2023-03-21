import React from 'react';
import classNames from 'classnames';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { Delta } from './Delta';

export type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

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
  return (
    <>
      <div className={classNames('relative flex flex-1 bg-white')}>
        {widgetValue.value === undefined && <LoadingSpinner />}
        <div className={classNames('flex flex-col items-start p-2')}>
          <p className={classNames('text-base text-gray-500')}>{title}</p>
          <div className="flex flex-row items-baseline gap-x-1">
            <p className={classNames('text-3xl font-semibold text-gray-900 ')}>
              {widgetValue.getFormattedValue()}
            </p>
            <p className="text-base text-design-subtitleGrey">{widgetValue.getUnits()}</p>
          </div>
          <div className="mt-1 flex flex-row items-baseline gap-x-1">
            <Delta widgetValue={widgetValue} sentimentDirection={sentimentDirection} />
            <p className={classNames('text-xs text-design-subtitleGrey sm:text-sm')}>{analysis}</p>
          </div>
        </div>
      </div>
    </>
  );
};

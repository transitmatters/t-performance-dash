import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { WidgetValueInterface } from '../../../types/basicWidgets';

import { LoadingSpinner } from '../../graphics/LoadingSpinner';
import { useDelimitatedRoute } from '../../../utils/router';

type SentimentDirection = 'positiveOnIncrease' | 'negativeOnIncrease';

export type BasicWidgetDataLayoutProps = {
  title: string;
  analysis: string;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
};

export const WidgetDataLayoutNoComparison: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis,
  widgetValue,
  sentimentDirection = 'negativeOnIncrease',
}) => {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const getDelta = () => {
    const deltaValue = widgetValue.getFormattedDelta();
    const increase = widgetValue.delta ? widgetValue.delta > 0 : false;
    const positiveSentiment =
      (!increase && sentimentDirection === 'negativeOnIncrease') ||
      (increase && sentimentDirection === 'positiveOnIncrease');
    const bgColor = positiveSentiment ? 'bg-green-100' : 'bg-red-100';
    const textColor = positiveSentiment ? 'text-green-800' : 'text-red-800';
    return (
      <div className="flex flex-row gap-x-2">
        <div
          className={classNames(
            'mt-1 flex flex-row items-center rounded-full',
            widgetValue.delta ? bgColor : 'bg-gray-100',
            widgetValue.delta ? textColor : 'text-rb-800'
          )}
        >
          <FontAwesomeIcon icon={increase ? faArrowUp : faArrowDown} className="h-6 px-2" />
        </div>
        <div className="flex flex-row items-baseline gap-x-1">
          <p className={classNames('text-3xl', widgetValue.delta ? textColor : 'text-rb-800')}>
            {deltaValue}
          </p>
          <p className="text-base text-design-subtitleGrey">{widgetValue.getUnits()}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={classNames('relative flex  flex-1 bg-white')}>
        {widgetValue.value === undefined && <LoadingSpinner />}
        <div className={classNames('flex flex-col items-start p-2')}>
          <p className={classNames('text-base text-gray-500')}>{title}</p>
          <div className="flex flex-row items-baseline gap-x-1">{getDelta()}</div>
          <div className="flex flex-row items-baseline gap-x-1">
            <p className={classNames('text-xs text-design-subtitleGrey sm:text-sm')}>
              {dayjs(startDate).format('MMM D, YYYY')} - {dayjs(endDate).format('MMM D, YYYY')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

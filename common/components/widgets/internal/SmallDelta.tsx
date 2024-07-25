import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendDown, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import type { WidgetValueInterface } from '../../../types/basicWidgets';

type SmallDeltaProps = {
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
};

export const SmallDelta: React.FC<SmallDeltaProps> = ({ analysis, widgetValue }) => {
  return (
    <div className="flex flex-row items-end justify-between">
      <p
        className={classNames('truncate text-xs leading-tight text-design-subtitleGrey sm:text-sm')}
      >
        {analysis}
      </p>
      {widgetValue.value !== undefined && (
        <div className={classNames('flex flex-row items-center gap-1 rounded-md px-2')}>
          {widgetValue.value !== 0 && (
            <FontAwesomeIcon
              icon={widgetValue.value > 0 ? faArrowTrendUp : faArrowTrendDown}
              className={widgetValue.value > 0 ? 'text-[#e84e3b]' : 'text-[#35c759]'}
            />
          )}
          <p className="flex flex-row">
            <span className="pr-1 font-bold text-gray-900">
              {widgetValue.value < 0 ? '-' : '+'}
            </span>
            {widgetValue.getFormattedValue()}
          </p>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import type { WidgetComparison } from '../MiniWidgetCreator';
import { getFormattedTimeString } from '../../../utils/time';

type SmallDataProps = {
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
  comparison?: WidgetComparison;
};

const formatComparisonDelta = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') {
    return `${Math.round(abs * 100)}pp`;
  }
  return getFormattedTimeString(abs);
};

const isNegligible = (comparison: WidgetComparison) => {
  if (comparison.unit === 'percentage') return Math.abs(comparison.delta) <= 0.01;
  return Math.abs(comparison.delta) <= 1;
};

export const SmallData: React.FC<SmallDataProps> = ({ analysis, widgetValue, comparison }) => {
  const negligible = comparison ? isNegligible(comparison) : false;

  return (
    <div className="flex flex-row items-end justify-between">
      <p className={classNames('truncate text-sm leading-tight text-design-subtitleGrey')}>
        {analysis}
      </p>
      <div className="flex flex-row items-baseline gap-x-1">
        {widgetValue.getFormattedValue()}
        {comparison && (
          <span
            title={
              negligible
                ? `About the same as ${comparison.label}`
                : `${formatComparisonDelta(comparison)} ${comparison.delta > 0 ? 'higher' : 'lower'} than ${comparison.label}`
            }
            className={classNames(
              'ml-0.5 cursor-default text-xs',
              negligible
                ? 'text-gray-400'
                : comparison.delta > 0
                  ? 'text-red-500'
                  : 'text-green-600'
            )}
          >
            <FontAwesomeIcon
              icon={negligible ? faMinus : comparison.delta > 0 ? faArrowUp : faArrowDown}
              size="xs"
            />
          </span>
        )}
      </div>
    </div>
  );
};

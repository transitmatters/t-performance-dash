import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import { getFormattedTimeString } from '../../utils/time';
import type { MiniWidgetObject, WidgetComparison } from './MiniWidgetCreator';

const formatComparisonDelta = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') return `${Math.round(abs * 100)}pp`;
  return getFormattedTimeString(abs);
};

const isNegligible = (comparison: WidgetComparison) =>
  comparison.unit === 'percentage'
    ? Math.abs(comparison.delta) <= 0.01
    : Math.abs(comparison.delta) <= 1;

/** On-time share is the one stat that carries a verdict, so it gets sentiment color. */
const isOnTimeStat = (label: string) => label.toLowerCase().includes('on time');

interface StatCellProps {
  label: React.ReactNode;
  children: React.ReactNode;
  valueClassName?: string;
}

const StatCell: React.FC<StatCellProps> = ({ label, children, valueClassName }) => (
  <div className="flex flex-col gap-y-1 bg-stone-50 px-3.5 py-2.5">
    <span className="text-[10px] font-medium tracking-[0.06em] text-stone-400 uppercase">
      {label}
    </span>
    <span
      className={classNames(
        'flex flex-row items-baseline gap-x-1 text-[17px] leading-none font-semibold text-stone-800',
        valueClassName
      )}
    >
      {children}
    </span>
  </div>
);

const ComparisonArrow: React.FC<{ comparison: WidgetComparison }> = ({ comparison }) => {
  const negligible = isNegligible(comparison);
  return (
    <span
      title={
        negligible
          ? `About the same as ${comparison.label}`
          : `${formatComparisonDelta(comparison)} ${
              comparison.delta > 0 ? 'higher' : 'lower'
            } than ${comparison.label}`
      }
      className={classNames(
        'cursor-default text-xs',
        negligible ? 'text-stone-400' : comparison.delta > 0 ? 'text-red-500' : 'text-green-600'
      )}
    >
      <FontAwesomeIcon
        icon={negligible ? faMinus : comparison.delta > 0 ? faArrowUp : faArrowDown}
        size="xs"
      />
    </span>
  );
};

interface StatStripProps {
  widgetObjects: MiniWidgetObject[];
}

/**
 * The summary numbers under a chart, as a hairline-separated strip. The 10th and 90th percentiles
 * read as one range rather than two unrelated figures, so they share a cell when both are present.
 */
export const StatStrip: React.FC<StatStripProps> = ({ widgetObjects }) => {
  const cells: React.ReactNode[] = [];

  for (let index = 0; index < widgetObjects.length; index++) {
    const widget = widgetObjects[index];
    const next = widgetObjects[index + 1];

    if (widget.text === '10%' && next?.text === '90%') {
      cells.push(
        <StatCell key={widget.text} label="10th – 90th pctl">
          {widget.widgetValue.getFormattedValue()}
          <span className="text-stone-400">–</span>
          {next.widgetValue.getFormattedValue()}
        </StatCell>
      );
      index++;
      continue;
    }

    const onTime = isOnTimeStat(widget.text);
    const percentage = onTime ? widget.widgetValue.value : undefined;
    cells.push(
      <StatCell
        key={widget.text}
        label={widget.text}
        valueClassName={classNames(
          onTime &&
            percentage !== undefined &&
            (percentage >= 0.7 ? 'text-green-700' : 'text-red-700')
        )}
      >
        {widget.widgetValue.getFormattedValue()}
        {widget.comparison && <ComparisonArrow comparison={widget.comparison} />}
      </StatCell>
    );
  }

  return (
    <div
      className="mt-3 grid gap-px overflow-hidden rounded-lg bg-black/[0.07]"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(9rem, 1fr))` }}
    >
      {cells}
    </div>
  );
};

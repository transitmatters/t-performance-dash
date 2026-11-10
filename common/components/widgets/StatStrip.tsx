import type { ReactNode } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import { getFormattedTimeString } from '../../utils/time';
import { InfoTooltip } from '../general/InfoTooltip';
import type { MiniWidgetObject, WidgetComparison } from './MiniWidgetCreator';

const formatComparisonDelta = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') return `${Math.round(abs * 100)}pp`;
  if (comparison.unit === 'mph') return `${abs.toFixed(1)} mph`;
  return getFormattedTimeString(abs);
};

const isNegligible = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') return abs <= 0.01;
  if (comparison.unit === 'mph') return abs < 0.05;
  return abs <= 1;
};

/** A longer trip or wait is worse; a higher speed or on-time share is better. */
const isWorse = (comparison: WidgetComparison) =>
  comparison.higherIsBetter ? comparison.delta < 0 : comparison.delta > 0;

/** On-time share is the one stat that carries a verdict, so it gets sentiment color. */
const isOnTimeStat = (label: string) => label.toLowerCase().includes('on time');

interface StatCellProps {
  label: ReactNode;
  description?: string;
  children: ReactNode;
  valueClassName?: string;
}

const StatCell = ({ label, description, children, valueClassName }: StatCellProps) => (
  // `bg-muted` rather than a fixed light grey: the figures inside inherit the card foreground, so a
  // cell pinned to stone-50 put near-white text on a near-white ground once the theme flipped.
  <div className="flex flex-col gap-y-1 bg-muted px-3.5 py-2.5">
    <span className="flex items-center gap-1 text-[10px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
      {label}
      {description && <InfoTooltip info={description} className="leading-none normal-case" />}
    </span>
    <span
      className={classNames(
        // Wraps so a comparison delta drops below the figure instead of squeezing it in a narrow cell.
        'text-card-foreground flex flex-row flex-wrap items-baseline gap-x-1 gap-y-1 text-[17px] leading-none font-semibold',
        valueClassName
      )}
    >
      {children}
    </span>
  </div>
);

const ComparisonArrow = ({ comparison }: { comparison: WidgetComparison }) => {
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
        'flex cursor-default items-baseline gap-x-0.5 text-xs font-medium whitespace-nowrap',
        negligible
          ? 'text-muted-foreground'
          : isWorse(comparison)
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-700 dark:text-green-400'
      )}
    >
      <FontAwesomeIcon
        icon={negligible ? faMinus : comparison.delta > 0 ? faArrowUp : faArrowDown}
        size="xs"
      />
      {!negligible && formatComparisonDelta(comparison)}
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
export const StatStrip = ({ widgetObjects }: StatStripProps) => {
  const cells: ReactNode[] = [];

  for (let index = 0; index < widgetObjects.length; index++) {
    const widget = widgetObjects[index];
    const next = widgetObjects[index + 1];

    if (widget.text === '10%' && next?.text === '90%') {
      cells.push(
        <StatCell key={widget.text} label="10th – 90th pctl">
          {widget.widgetValue.getFormattedValue()}
          <span className="text-muted-foreground">–</span>
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
        description={widget.description}
        valueClassName={classNames(
          onTime &&
            percentage !== undefined &&
            (percentage >= 0.7
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400')
        )}
      >
        {widget.widgetValue.getFormattedValue()}
        {widget.comparison && <ComparisonArrow comparison={widget.comparison} />}
      </StatCell>
    );
  }

  return (
    <div
      // The container color shows through the 1px gaps as the hairlines between cells, so it has to
      // be a border token rather than a fixed black tint that vanishes on a dark card.
      className="mt-3 grid gap-px overflow-hidden rounded-lg bg-border"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(9rem, 1fr))` }}
    >
      {cells}
    </div>
  );
};

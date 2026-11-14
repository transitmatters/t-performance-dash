import { useState } from 'react';
import type { CSSProperties } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Calendar } from '../../../common/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/ui/popover';
import { DATE_FORMAT, getDatePickerBounds } from '../../../common/constants/dates';
import { ToggleControl } from '../../../common/hooks/useChartToggle';
import { useDatePresetStore } from '../../../common/state/datePresetStore';
import { checkForPreset } from '../../../common/state/utils/datePresetUtils';
import {
  CONTROL_SURFACE,
  FOCUS_RING_ON_SURFACE,
  lineColorVar,
  needsDarkTextOn,
} from '../../../common/styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../common/utils/router';
import type { Period } from '../types';
import { useShownPeriod } from '../useBusSpeedParams';
import {
  canStepPeriod,
  clampDate,
  isPeriodInProgress,
  periodEnd,
  periodLabel,
  periodStart,
  stepPeriod,
} from '../utils';
import { MonthGrid } from './MonthGrid';

const UNIT: Record<Period, string> = { daily: 'day', weekly: 'week', monthly: 'month' };

const toDate = (date: string) => dayjs(date).toDate();
const fromDate = (date: Date) => dayjs(date).format(DATE_FORMAT);

/** The latest period with data, and the one before it, named relative to today. */
const getPresets = (period: Period, maxDate: string): [string, string][] => {
  if (period === 'daily') {
    const weekAgo = dayjs(maxDate).add(1, 'day').subtract(7, 'day');
    return [
      ['Yesterday', maxDate],
      [`Last ${weekAgo.format('dddd')}`, weekAgo.format(DATE_FORMAT)],
    ];
  }
  const unit = UNIT[period];
  const previous = stepPeriod(maxDate, period, -1);
  return isPeriodInProgress(maxDate, period)
    ? [
        [`This ${unit} (so far)`, maxDate],
        [`Last ${unit}`, previous],
      ]
    : [
        [`Last ${unit}`, maxDate],
        [`The ${unit} before`, previous],
      ];
};

const STEP_BUTTON = classNames(
  'flex w-10 shrink-0 items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent md:w-8 dark:text-stone-400 dark:hover:bg-stone-800',
  FOCUS_RING_ON_SURFACE
);

/**
 * Day, week or month, and which one. The URL keeps a single date; the label always names the whole
 * span on screen, so picking a day never quietly shows its month.
 */
export const PeriodDateControl = () => {
  const {
    tab,
    page,
    colorKey,
    query: { date },
  } = useDelimitatedRoute();
  const { minDate, maxDate } = getDatePickerBounds(tab, page);
  const { shown: period, setValue: setPeriod, options, lockedToMonth } = useShownPeriod();
  const updateQueryParams = useUpdateQuery();
  const setDatePreset = useDatePresetStore((state) => state.setDatePreset);
  const [open, setOpen] = useState(false);

  if (!date) return null;

  const setDate = (next: string) => {
    const clamped = clampDate(next, minDate, maxDate);
    updateQueryParams({ date: clamped }, false);
    // Keeps the trips pages' preset label in step, since they share this date.
    setDatePreset(checkForPreset({ date: clamped }), 'singleTrips', false);
  };

  const pick = (next: string) => {
    setDate(periodStart(next, period));
    setOpen(false);
  };

  const unit = UNIT[period];
  const presets = getPresets(period, maxDate).filter(
    ([, value]) => periodEnd(value, period) >= minDate
  );
  const selectedStart = periodStart(date, period);
  const disabledDays = [{ before: toDate(minDate) }, { after: toDate(maxDate) }];
  const calendarProps = {
    defaultMonth: toDate(date),
    startMonth: toDate(minDate),
    endMonth: toDate(maxDate),
    disabled: disabledDays,
    weekStartsOn: 1 as const,
  };

  return (
    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
      {!lockedToMonth && (
        <ToggleControl variant="toggle" value={period} options={options} onChange={setPeriod} />
      )}
      <div
        className={classNames(
          'flex h-10 w-full flex-row items-stretch overflow-hidden rounded-md md:h-8 md:w-auto',
          CONTROL_SURFACE
        )}
      >
        <button
          type="button"
          className={STEP_BUTTON}
          aria-label={`Previous ${unit}`}
          disabled={!canStepPeriod(date, period, -1, minDate, maxDate)}
          onClick={() => setDate(stepPeriod(date, period, -1))}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="size-3" aria-hidden />
        </button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={classNames(
              'flex flex-1 items-center justify-center gap-x-2 border-x border-stone-200 px-3 text-sm font-medium whitespace-nowrap tabular-nums hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800',
              FOCUS_RING_ON_SURFACE
            )}
            title={lockedToMonth ? 'This ranking covers whole months' : undefined}
          >
            <FontAwesomeIcon
              icon={faCalendarDay}
              className="size-3.5 text-stone-500 dark:text-stone-400"
              aria-hidden
            />
            {periodLabel(date, period)}
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3 text-stone-500 dark:text-stone-400"
              aria-hidden
            />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-auto gap-0 overflow-hidden p-0"
            aria-label={`Choose a ${unit}`}
            style={
              {
                ...lineColorVar(colorKey),
                '--primary': 'var(--line-color)',
                '--primary-foreground': needsDarkTextOn(colorKey)
                  ? 'var(--color-stone-900)'
                  : '#fff',
              } as CSSProperties
            }
          >
            <div className="flex flex-col sm:flex-row">
              <div className="flex flex-row flex-wrap gap-1 border-b border-stone-200 bg-stone-50 p-2 sm:w-44 sm:flex-col sm:border-r sm:border-b-0 dark:border-stone-700 dark:bg-stone-900">
                {presets.map(([name, value]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => pick(value)}
                    className={classNames(
                      'rounded-md px-3 py-1.5 text-left text-sm',
                      periodStart(value, period) === selectedStart
                        ? 'bg-stone-200 font-semibold text-stone-900 dark:bg-stone-700 dark:text-stone-100'
                        : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
                      FOCUS_RING_ON_SURFACE
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1 p-1">
                {period === 'daily' && (
                  <Calendar
                    mode="single"
                    selected={toDate(date)}
                    onSelect={(day) => day && pick(fromDate(day))}
                    {...calendarProps}
                  />
                )}
                {period === 'weekly' && (
                  <Calendar
                    mode="range"
                    selected={{
                      from: toDate(selectedStart),
                      to: toDate(periodEnd(date, period)),
                    }}
                    // Any day picks its whole week.
                    onSelect={(_range, day) => pick(fromDate(day))}
                    {...calendarProps}
                  />
                )}
                {period === 'monthly' && (
                  <MonthGrid date={date} minDate={minDate} maxDate={maxDate} onPick={pick} />
                )}
                <p className="px-2 pb-2 text-xs text-stone-500 dark:text-stone-400">
                  {period === 'weekly' && 'Weeks run Monday to Sunday. '}
                  Speed maps start {dayjs(minDate).format('MMM D, YYYY')}.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          className={STEP_BUTTON}
          aria-label={`Next ${unit}`}
          disabled={!canStepPeriod(date, period, 1, minDate, maxDate)}
          onClick={() => setDate(stepPeriod(date, period, 1))}
        >
          <FontAwesomeIcon icon={faChevronRight} className="size-3" aria-hidden />
        </button>
      </div>
    </div>
  );
};

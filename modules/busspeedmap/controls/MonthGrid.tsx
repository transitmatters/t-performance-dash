import { useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DATE_FORMAT } from '../../../common/constants/dates';
import { FOCUS_RING_ON_SURFACE } from '../../../common/styles/general';

interface MonthGridProps {
  /** YYYY-MM-DD; its month is the one selected. */
  date: string;
  minDate: string;
  maxDate: string;
  onPick: (date: string) => void;
}

const NAV_BUTTON = classNames(
  'flex size-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800',
  FOCUS_RING_ON_SURFACE
);

/** A year of months to pick from, with the months outside the bounds disabled. */
export const MonthGrid = ({ date, minDate, maxDate, onPick }: MonthGridProps) => {
  const [year, setYear] = useState(dayjs(date).year());
  const selected = dayjs(date).format('YYYY-MM');

  return (
    <div className="flex w-64 flex-col gap-3 p-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <button
          type="button"
          className={NAV_BUTTON}
          aria-label="Previous year"
          disabled={year <= dayjs(minDate).year()}
          onClick={() => setYear(year - 1)}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="size-3" aria-hidden />
        </button>
        {year}
        <button
          type="button"
          className={NAV_BUTTON}
          aria-label="Next year"
          disabled={year >= dayjs(maxDate).year()}
          onClick={() => setYear(year + 1)}
        >
          <FontAwesomeIcon icon={faChevronRight} className="size-3" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 12 }, (_, month) => {
          const start = dayjs(new Date(year, month, 1));
          const first = start.format(DATE_FORMAT);
          const last = start.endOf('month').format(DATE_FORMAT);
          const isSelected = start.format('YYYY-MM') === selected;
          return (
            <button
              key={month}
              type="button"
              disabled={first > maxDate || last < minDate}
              aria-pressed={isSelected}
              onClick={() => onPick(first)}
              className={classNames(
                'h-9 rounded-md text-sm disabled:opacity-30',
                isSelected
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : 'hover:bg-stone-100 disabled:hover:bg-transparent dark:hover:bg-stone-800',
                FOCUS_RING_ON_SURFACE
              )}
            >
              {start.format('MMM')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

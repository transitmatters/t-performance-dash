import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { getDatePickerBounds } from '../../../constants/dates';
import { CONTROL_SURFACE, FOCUS_RING_ON_SURFACE } from '../../../styles/general';
import type { QueryTypeOptions } from '../../../types/router';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { DateField } from './DateField';

interface DatePickerProps {
  type: QueryTypeOptions;
  clearPreset: () => void;
}

/**
 * The date fields themselves. They only ever edit dates that are already there: the router fills in
 * and clamps missing or out-of-bounds dates before the page renders (see `redirectToCanonicalSearch`).
 */
export const DatePickers = ({ type, clearPreset }: DatePickerProps) => {
  const updateQueryParams = useUpdateQuery();
  const { query, line, tab, page } = useDelimitatedRoute();
  const { startDate, endDate, date } = query;
  const range = type === 'range';
  const { minDate, maxDate } = getDatePickerBounds(
    tab,
    page,
    query.busRoute ?? query.crRoute ?? query.ferryRoute
  );

  const handleEndDateChange = (newDate: string) => {
    if (!startDate || newDate === startDate) return;
    // Swap start and end if new end < startDate
    if (newDate < startDate) updateQueryParams({ startDate: newDate, endDate: startDate }, false);
    else updateQueryParams({ startDate, endDate: newDate }, false);
    clearPreset();
  };

  const handleStartDateChange = (newDate: string) => {
    if (!endDate || newDate === endDate) return;
    // Swap start and end if new start > endDate
    if (newDate > endDate) updateQueryParams({ startDate: endDate, endDate: newDate }, false);
    else updateQueryParams({ startDate: newDate, endDate }, false);
    clearPreset();
  };

  const handleDateChange = (newDate: string) => {
    updateQueryParams({ date: newDate }, false);
    clearPreset();
  };

  const fieldClassName = classNames(
    'flex h-full min-w-0 flex-1 items-center justify-center rounded-sm bg-transparent px-2 text-sm whitespace-nowrap tabular-nums hover:bg-stone-100 md:flex-none dark:hover:bg-stone-800',
    FOCUS_RING_ON_SURFACE
  );

  return (
    <div
      className={classNames(
        'flex h-10 w-full flex-row items-center gap-0.5 rounded-md px-1 hover:bg-white md:h-8 md:w-auto dark:hover:bg-stone-900',
        CONTROL_SURFACE
      )}
    >
      <DateField
        value={range ? startDate : date}
        minDate={minDate}
        maxDate={maxDate}
        line={line}
        className={fieldClassName}
        onChange={range ? handleStartDateChange : handleDateChange}
      />
      {range ? (
        <>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="size-3 shrink-0 text-stone-500 dark:text-stone-400"
            aria-label="to"
          />
          <DateField
            value={endDate}
            minDate={minDate}
            maxDate={maxDate}
            line={line}
            className={fieldClassName}
            onChange={handleEndDateChange}
          />
        </>
      ) : null}
    </div>
  );
};

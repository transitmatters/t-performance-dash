import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { getDatePickerBounds } from '../../../constants/dates';
import { FOCUS_RING_ON_SURFACE } from '../../../styles/general';
import type { QueryTypeOptions } from '../../../types/router';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { DateField } from './DateField';

interface DatePickerProps {
  type: QueryTypeOptions;
  clearPreset: () => void;
}

/**
 * The date fields themselves. They only ever edit dates that are already there: the router fills in
 * and clamps missing or out-of-bounds dates before the page renders (see `redirectToCompleteDates`).
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
    'flex w-27 cursor-pointer border-none bg-transparent px-2 py-0 text-center text-sm text-stone-900',
    FOCUS_RING_ON_SURFACE
  );

  return (
    <div className="-ml-px flex h-10 flex-row justify-center self-stretch rounded-r-[calc(var(--radius-md)-1px)] bg-white md:h-7">
      <div className={classNames('flex h-full flex-row items-center self-stretch')}>
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
            <div
              className={classNames('flex items-center self-stretch bg-white text-sm text-black')}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-black" />
            </div>

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
    </div>
  );
};

import { faArrowRight, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import dayjs from 'dayjs';
import 'flatpickr/dist/themes/light.css';
import type { SetStateAction } from 'react';
import React from 'react';
import Flatpickr from 'react-flatpickr';
import {
  RANGE_PRESETS,
  TODAY_STRING,
  getDatePickerOptions,
  getValidDateForRange,
  isDateValid,
} from '../../../constants/dates';
import { ALL_PAGES } from '../../../constants/pages';
import { getDefaultDates } from '../../../state/defaults/dateDefaults';
import { buttonHighlightFocus } from '../../../styles/general';
import type { Line } from '../../../types/lines';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { getMinMaxDatesForRoute } from '../../../utils/stations';
import { RangeButton } from './RangeButton';

interface DatePickerProps {
  range: boolean;
  setRange: React.Dispatch<SetStateAction<boolean>>;
  type: 'combo' | 'range' | 'single';
  clearPreset: () => void;
}

const updateColor = (line: Line | undefined) => {
  const selectedDates = document.querySelectorAll('.flatpickr-day.selected');
  selectedDates.forEach((selectedDate) => {
    if (line) {
      selectedDate?.classList.add(`selected-date-${line}`);
    }
  });
};

export const DatePickers: React.FC<DatePickerProps> = ({ range, setRange, type, clearPreset }) => {
  const updateQueryParams = useUpdateQuery();
  const { query, line, tab, page } = useDelimitatedRoute();
  const { startDate, endDate, date, busRoute } = query;
  const endDateObject = dayjs(endDate);
  const startDateObject = dayjs(startDate ?? date);
  const isSingleDate = page === 'singleTrips';

  const handleRangeToggle = () => {
    if (range) {
      updateQueryParams({ startDate: startDate }, !range, false);
    } else if (startDate === TODAY_STRING) {
      // If start date is today -> set range to past week. This prevents bugs with startDate === endDate
      const weekPreset = RANGE_PRESETS[tab]?.week;
      if (weekPreset) {
        updateQueryParams(weekPreset.input, !range, false);
      } else {
        updateQueryParams(RANGE_PRESETS[0].input, !range, false);
      }
    } else {
      updateQueryParams({ startDate: startDate }, !range, false);
    }
    setRange(!range);
  };

  const handleEndDateChange = (newDate: string) => {
    const updatedDate = dayjs(newDate);
    if (updatedDate.isSame(startDateObject)) {
      if (type === 'combo') handleRangeToggle();
      return;
    }
    if (updatedDate.isBefore(startDateObject)) {
      // Swap start and end if new end < startDate
      updateQueryParams({ startDate: newDate, endDate: startDate }, range, false);
    } else {
      updateQueryParams({ startDate: startDate, endDate: newDate }, range, false);
    }
    clearPreset();
  };

  const handleStartDateChange = (newDate: string) => {
    const updatedDate = dayjs(newDate);
    if (updatedDate.isSame(endDateObject)) {
      if (type === 'combo') handleRangeToggle();
      return;
    }
    if (updatedDate.isAfter(endDateObject)) {
      // Swap start and end if new start > endDate
      updateQueryParams({ startDate: endDate, endDate: newDate }, range, false);
    } else {
      updateQueryParams({ startDate: newDate, endDate: endDate }, range, false);
    }
    clearPreset();
  };

  const handleDateChange = (newDate: string) => {
    updateQueryParams({ date: newDate }, false, false);
    clearPreset();
  };

  React.useEffect(() => {
    updateColor(line);
  }, [line]);

  React.useEffect(() => {
    if (tab && page) {
      const pageObject = ALL_PAGES[page];
      const { minDate, maxDate } = getMinMaxDatesForRoute(tab, busRoute);
      const defaultDateParams = getDefaultDates(pageObject.dateStoreSection, tab);

      // Update dates if none are set OR if current dates are outside valid range
      if (!date && !startDate && !endDate) {
        if (minDate || maxDate) {
          if (range) {
            if (minDate && maxDate) {
              updateQueryParams({ startDate: minDate, endDate: maxDate }, true);
            } else if (minDate) {
              updateQueryParams({ startDate: minDate, endDate: TODAY_STRING }, true);
            } else if (maxDate) {
              const startDate = dayjs(maxDate).subtract(7, 'days').format('YYYY-MM-DD');
              updateQueryParams({ startDate, endDate: maxDate }, true);
            }
          } else {
            updateQueryParams({ date: maxDate || minDate }, false);
          }
        } else if (defaultDateParams) {
          updateQueryParams(defaultDateParams, range);
        }
      } else if (minDate || maxDate) {
        // Route change case - check if current dates are valid
        if (range) {
          const isStartValid = isDateValid(startDate, minDate, maxDate);
          const isEndValid = isDateValid(endDate, minDate, maxDate);

          if (!isStartValid || !isEndValid) {
            updateQueryParams(
              {
                startDate: getValidDateForRange(startDate, minDate, maxDate, false),
                endDate: getValidDateForRange(endDate, minDate, maxDate, true),
              },
              true
            );
          }
        } else {
          // Handle both date and startDate for single date mode
          const currentDate = date || startDate;
          if (currentDate && !isDateValid(currentDate, minDate, maxDate)) {
            updateQueryParams({ date: getValidDateForRange(currentDate, minDate, maxDate) }, false);
          }
        }
      }
    }
  }, [tab, page, startDate, endDate, updateQueryParams, date, busRoute, range]);

  return (
    <div className="-ml-[1px] flex h-10 flex-row justify-center self-stretch rounded-r-md bg-white md:h-7">
      <div className={classNames('bg-opacity-80 flex h-full flex-row self-stretch')}>
        <Flatpickr
          className={classNames(
            'focus:ring-opacity-0 flex w-[6.75rem] cursor-pointer border-none bg-transparent px-2 py-0 text-center text-sm',
            line && buttonHighlightFocus[line]
          )}
          value={startDate ?? date}
          key={'start'}
          placeholder={'mm/dd/yyyy'}
          options={getDatePickerOptions(tab, page, query.busRoute ?? query.crRoute)}
          onChange={(dates, currentDateString) => {
            if (isSingleDate) {
              handleDateChange(currentDateString);
            } else {
              handleStartDateChange(currentDateString);
            }
          }}
          onMonthChange={() => updateColor(line)}
          onOpen={() => updateColor(line)}
        />
        {range ? (
          <>
            <div
              className={classNames('flex items-center self-stretch bg-white text-sm text-black')}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-black" />
            </div>

            <Flatpickr
              className={classNames(
                'focus:ring-opacity-0 flex w-[6.75rem] cursor-pointer border-none bg-transparent px-2 py-0 text-center text-sm',
                line && buttonHighlightFocus[line]
              )}
              value={endDate}
              key={'end'}
              placeholder={'mm/dd/yyyy'}
              options={getDatePickerOptions(tab, page, query.busRoute ?? query.crRoute)}
              onChange={(dates, currentDateString) => {
                handleEndDateChange(currentDateString);
              }}
              onMonthChange={() => updateColor(line)}
              onOpen={() => updateColor(line)}
            />
          </>
        ) : null}
        {type === 'combo' && (
          <RangeButton onClick={handleRangeToggle}>
            {range ? (
              <FontAwesomeIcon icon={faClose} className="h-4 w-4 text-black" />
            ) : (
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-black" />
            )}
          </RangeButton>
        )}
      </div>
    </div>
  );
};

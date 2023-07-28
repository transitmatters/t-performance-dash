import dayjs from 'dayjs';
import type { SetStateAction } from 'react';
import React from 'react';
import classNames from 'classnames';
import { faArrowRight, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { FLAT_PICKER_OPTIONS, TODAY_STRING, RANGE_PRESETS } from '../../../constants/dates';
import { buttonHighlightFocus } from '../../../styles/general';
import type { Line } from '../../../types/lines';
import { ALL_PAGES } from '../../../constants/pages';
import { getDefaultDates } from '../../../state/defaults/dateDefaults';
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
  const { startDate, endDate, date } = query;
  const endDateObject = dayjs(endDate);
  const startDateObject = dayjs(startDate ?? date);
  const isSingleDate = page === 'singleTrips';

  const handleRangeToggle = () => {
    if (range) {
      updateQueryParams({ startDate: startDate }, !range, false);
    } else if (startDate === TODAY_STRING) {
      // If start date is today -> set range to past week. This prevents bugs with startDate === endDate
      updateQueryParams(RANGE_PRESETS[0].input, !range, false);
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
    if (tab && page && !date && !startDate && !endDate) {
      const pageObject = ALL_PAGES[page];
      const defaultDateParams = getDefaultDates(pageObject.dateStoreSection, tab);
      if (defaultDateParams) updateQueryParams(defaultDateParams, true);
    }
  }, [tab, page, startDate, endDate, updateQueryParams, date]);

  return (
    <div className="-ml-[1px] flex h-10 flex-row justify-center self-stretch rounded-r-md bg-white md:h-7">
      <div className={classNames('flex h-full flex-row self-stretch bg-opacity-80')}>
        <Flatpickr
          className={classNames(
            'flex w-[6.75rem] cursor-pointer border-none bg-transparent px-2 py-0 text-center text-sm focus:ring-opacity-0',
            line && buttonHighlightFocus[line]
          )}
          value={startDate ?? date}
          key={'start'}
          placeholder={'mm/dd/yyyy'}
          options={FLAT_PICKER_OPTIONS[tab]}
          onChange={(dates, currentDateString) => {
            isSingleDate
              ? handleDateChange(currentDateString)
              : handleStartDateChange(currentDateString);
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
                'flex w-[6.75rem] cursor-pointer border-none bg-transparent px-2 py-0 text-center text-sm focus:ring-opacity-0',
                line && buttonHighlightFocus[line]
              )}
              value={endDate}
              key={'end'}
              placeholder={'mm/dd/yyyy'}
              options={FLAT_PICKER_OPTIONS[tab]}
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

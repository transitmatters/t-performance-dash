import dayjs from 'dayjs';
import type { SetStateAction } from 'react';
import React from 'react';
import classNames from 'classnames';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { FLAT_PICKER_OPTIONS } from '../../../constants/dates';
import { buttonHighlightFocus } from '../../../styles/general';

interface DatePickerProps {
  range: boolean;
  setSelection: React.Dispatch<SetStateAction<number | undefined>>;
}

export const DatePickers: React.FC<DatePickerProps> = ({ range, setSelection }) => {
  const updateQueryParams = useUpdateQuery();
  const { query, line, tab } = useDelimitatedRoute();
  const { startDate, endDate } = query;
  const endDateObject = dayjs(endDate);
  const startDateObject = dayjs(startDate);

  const handleEndDateChange = (date: string) => {
    const updatedDate = dayjs(date);
    if (updatedDate.isSame(startDateObject)) {
      // TODO: set to undefined?
      return;
    }
    if (updatedDate.isBefore(startDateObject)) {
      // Swap start and end if new end < startDate
      updateQueryParams({ startDate: date, endDate: startDate }, range);
    } else {
      updateQueryParams({ startDate: startDate, endDate: date }, range);
    }
    setSelection(undefined);
  };

  const handleStartDateChange = (date: string) => {
    const updatedDate = dayjs(date);
    if (updatedDate.isSame(endDateObject)) {
      // TODO: set to undefined?
      return;
    }
    if (updatedDate.isAfter(endDateObject)) {
      // Swap start and end if new start > endDate
      updateQueryParams({ startDate: endDate, endDate: date }, range);
    } else {
      updateQueryParams({ startDate: date, endDate: endDate }, range);
    }
    setSelection(undefined);
  };

  return (
    <div className={'-ml-[1px] flex flex-row self-stretch '}>
      <div className={classNames('flex h-full flex-row self-stretch bg-opacity-80')}>
        <Flatpickr
          //TODO: Change calendar to line color
          className={classNames(
            'w-28 cursor-pointer border-none py-0 text-sm focus:ring-opacity-0',
            line && buttonHighlightFocus[line]
          )}
          value={startDate}
          key={'start'}
          placeholder={'mm/dd/yyyy'}
          options={FLAT_PICKER_OPTIONS[tab]}
          onChange={(dates, currentDateString) => {
            handleStartDateChange(currentDateString);
          }}
        />
        {range ? (
          <>
            <div
              className={classNames('flex items-center self-stretch bg-white text-sm text-black')}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-black" />
            </div>

            <Flatpickr
              //TODO: Change calendar to line color
              className={classNames(
                'w-28 cursor-pointer border-none py-0 text-sm focus:ring-opacity-0',
                line && buttonHighlightFocus[line]
              )}
              value={endDate}
              key={'end'}
              placeholder={'mm/dd/yyyy'}
              options={FLAT_PICKER_OPTIONS[tab]}
              onChange={(dates, currentDateString) => {
                handleEndDateChange(currentDateString);
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

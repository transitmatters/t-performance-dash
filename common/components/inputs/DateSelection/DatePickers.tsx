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
import { RangeButton } from './RangeButton';

interface DatePickerProps {
  range: boolean;
  setRange: React.Dispatch<SetStateAction<boolean>>;
  type: 'combo' | 'range' | 'single';
  clearPreset: () => void;
}

export const DatePickers: React.FC<DatePickerProps> = ({ range, setRange, type, clearPreset }) => {
  const updateQueryParams = useUpdateQuery();
  const { query, line, tab } = useDelimitatedRoute();
  const { startDate, endDate } = query;
  const endDateObject = dayjs(endDate);
  const startDateObject = dayjs(startDate);

  const handleRangeToggle = () => {
    if (range) {
      updateQueryParams({ startDate: startDate }, !range);
    } else if (startDate === TODAY_STRING) {
      // If start date is today -> set range to past week. This prevents bugs with startDate === endDate
      updateQueryParams(RANGE_PRESETS[0].input, !range);
    } else {
      updateQueryParams({ startDate: startDate }, !range);
    }
    setRange(!range);
  };

  const handleEndDateChange = (date: string) => {
    const updatedDate = dayjs(date);
    if (updatedDate.isSame(startDateObject)) {
      if (type === 'combo') handleRangeToggle();
      return;
    }
    if (updatedDate.isBefore(startDateObject)) {
      // Swap start and end if new end < startDate
      updateQueryParams({ startDate: date, endDate: startDate }, range);
    } else {
      updateQueryParams({ startDate: startDate, endDate: date }, range);
    }
    clearPreset();
  };

  const handleStartDateChange = (date: string) => {
    const updatedDate = dayjs(date);
    if (updatedDate.isSame(endDateObject)) {
      if (type === 'combo') handleRangeToggle();
      return;
    }
    if (updatedDate.isAfter(endDateObject)) {
      // Swap start and end if new start > endDate
      updateQueryParams({ startDate: endDate, endDate: date }, range);
    } else {
      updateQueryParams({ startDate: date, endDate: endDate }, range);
    }
    clearPreset();
  };

  return (
    <div className={'-ml-[1px] flex h-8 flex-row justify-center self-stretch bg-white'}>
      <div className={classNames('flex h-full flex-row self-stretch bg-opacity-80')}>
        <Flatpickr
          //TODO: Change calendar to line color
          className={classNames(
            'flex w-[6.75rem] cursor-pointer border-none px-2 py-0 text-center text-sm focus:ring-opacity-0',
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
                'flex w-[6.75rem] cursor-pointer border-none px-2 py-0 text-center text-sm focus:ring-opacity-0',
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

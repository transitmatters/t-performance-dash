import dayjs from 'dayjs';
import type { SetStateAction } from 'react';
import React from 'react';
import classNames from 'classnames';
import { faClose, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { buttonHighlightConfig } from '../styles/inputStyle';
import { RangeButton } from './RangeButton';
import type { DateSelectionInput } from './types/DateSelectionTypes';
import { DATE_PICKER_PRESETS, FLAT_PICKER_OPTIONS, TODAY_STRING } from './DateConstants';

interface DatePickerProps {
  config: DateSelectionInput;
  setConfig: React.Dispatch<SetStateAction<DateSelectionInput>>;
}

export const DatePickers: React.FC<DatePickerProps> = ({ config, setConfig }) => {
  const updateQueryParams = useUpdateQuery();
  const { query, line, tab } = useDelimitatedRoute();
  const { startDate, endDate } = query;
  const endDateObject = dayjs(endDate);
  const startDateObject = dayjs(startDate);

  const handleEndDateChange = (date: string) => {
    const updatedDate = dayjs(date);
    if (updatedDate.isSame(startDateObject)) {
      // Convert to single day mode when startDate == endDate
      handleRangeToggle();
      return;
    }
    if (updatedDate.isBefore(startDateObject)) {
      // Swap start and end if new end < startDate
      updateQueryParams({ startDate: date, endDate: startDate }, config.range);
    } else {
      updateQueryParams({ startDate: startDate, endDate: date }, config.range);
    }
    setConfig({ ...config, selection: undefined });
  };

  const handleStartDateChange = (date: string) => {
    const updatedDate = dayjs(date);
    if (updatedDate.isSame(endDateObject)) {
      // Convert to single day mode when startDate == endDate
      handleRangeToggle();
      return;
    }
    if (updatedDate.isAfter(endDateObject)) {
      // Swap start and end if new start > endDate
      updateQueryParams({ startDate: endDate, endDate: date }, config.range);
    } else {
      updateQueryParams({ startDate: date, endDate: endDate }, config.range);
    }
    setConfig({ ...config, selection: undefined });
  };

  // Handle swapping between single day and aggregates.
  const handleRangeToggle = () => {
    if (config.range) {
      updateQueryParams({ startDate: startDate }, !config.range);
    } else if (startDate === TODAY_STRING) {
      // If start date is today -> set range to past week. This prevents bugs with startDate === endDate
      updateQueryParams(DATE_PICKER_PRESETS.range[0].input, !config.range);
    } else {
      updateQueryParams({ startDate: startDate }, !config.range);
    }
    setConfig({ selection: undefined, range: !config.range });
  };

  return (
    <div className={'-ml-[1px] flex flex-row self-stretch '}>
      <div className={classNames('flex h-full flex-row self-stretch bg-opacity-80')}>
        <Flatpickr
          //TODO: Change calendar to line color
          className={classNames(
            'w-32 cursor-pointer border-none py-0 focus:ring-opacity-0',
            line && buttonHighlightConfig[line]
          )}
          value={startDate}
          key={'start'}
          placeholder={'mm/dd/yyyy'}
          options={FLAT_PICKER_OPTIONS[tab]}
          onChange={(dates, currentDateString) => {
            handleStartDateChange(currentDateString);
          }}
        />
        {config.range ? (
          <>
            <div
              className={classNames('flex items-center self-stretch bg-white text-sm text-black')}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-black" />
            </div>

            <Flatpickr
              //TODO: Change calendar to line color
              className={classNames(
                'w-32 cursor-pointer border-none py-0 focus:ring-opacity-0',
                line && buttonHighlightConfig[line]
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
        <RangeButton onClick={handleRangeToggle}>
          {config.range ? (
            <FontAwesomeIcon icon={faClose} className="h-4 w-4 text-black" />
          ) : (
            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-black" />
          )}
        </RangeButton>
      </div>
    </div>
  );
};

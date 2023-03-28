import dayjs from 'dayjs';
import { SetStateAction, useRef } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { faClose, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { DatePickerButton } from '../DatePickerButton';
import { lineColorBackground, lineColorDarkBorder } from '../../../styles/general';

interface DatePickerProps {
  config: any;
  setConfig: React.Dispatch<SetStateAction<any>>;
}

const today = dayjs().format('YYYY-MM-DD');

export const DatePickers: React.FC<DatePickerProps> = ({ config, setConfig }) => {
  const updateQueryParams = useUpdateQuery();
  const { line, query } = useDelimitatedRoute();
  const { startDate, endDate } = query;
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const handleChange = () => {
    const startDateInput = document.getElementById('start')
      ? (document.getElementById('start') as HTMLInputElement).value
      : undefined;
    const endDateInput = document.getElementById('end')
      ? (document.getElementById('end') as HTMLInputElement).value
      : undefined;
    const startDateObject = dayjs(startDateInput);
    const endDateObject = dayjs(endDateInput);
    if (startDateObject.isAfter(endDateObject)) {
      (document.getElementById('start') as HTMLInputElement).value = endDateInput ?? '';
      (document.getElementById('end') as HTMLInputElement).value = startDateInput ?? '';
      updateQueryParams({ startDate: endDateInput, endDate: startDateInput }, config.range);
    } else {
      updateQueryParams({ startDate: startDateInput, endDate: endDateInput }, config.range);
    }
    setCustom(true);
    setConfig({ ...config, selection: undefined });
  };

  const handleRangeToggle = () => {
    if (config.range) {
      updateQueryParams({ startDate: startDate }, !config.range);
    } else {
      updateQueryParams({ startDate: startDate, endDate: startDate }, !config.range);
    }
    setConfig({ selection: undefined, range: !config.range });
  };

  useEffect(() => {
    if (startDate && document.getElementById('start'))
      (document.getElementById('start') as HTMLInputElement).value = startDate;
    if (endDate && document.getElementById('end'))
      (document.getElementById('end') as HTMLInputElement).value = endDate;
  }, [endDate, startDate]);

  return (
    <div
      className={classNames(
        '-ml-[1px] flex flex-row border',
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
    >
      <div
        className={classNames(
          lineColorBackground[line ?? 'DEFAULT'],
          ' flex flex-row bg-opacity-80'
        )}
      >
        <label htmlFor="start" className="hidden">
          Start Date
        </label>
        <input
          id="start"
          ref={startDateRef}
          onMouseOver={() => (startDateRef?.current.style.backgroundColor = '#00000000')}
          onMouseOut={() => (startDateRef?.current.style.backgroundColor = '#00000018')}
          type="date"
          max={today}
          min={'2016-01-15'}
          onChange={handleChange}
          placeholder="mm/dd/yyyy"
          style={{
            paddingTop: '4px',
            paddingBottom: '4px',
            backgroundColor: '#00000018',
            color: 'white',
            colorScheme: 'dark',
            border: '0px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        />
        {config.range ? (
          <>
            <div
              className={classNames(
                'flex items-center self-stretch bg-black bg-opacity-10 text-sm text-white'
              )}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-white" />
            </div>

            <>
              <label htmlFor="end" className="hidden">
                End Date
              </label>
              <input
                id="end"
                ref={endDateRef}
                onMouseOver={() => (endDateRef?.current.style.backgroundColor = '#00000000')}
                onMouseOut={() => (endDateRef?.current.style.backgroundColor = '#00000018')}
                type="date"
                max={today}
                min={'2016-01-15'}
                placeholder="mm/dd/yyyy"
                onChange={handleChange}
                style={{
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  backgroundColor: '#00000018',
                  color: 'white',
                  colorScheme: 'dark',
                  border: '0px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              />
            </>
          </>
        ) : null}
        <DatePickerButton onClick={handleRangeToggle}>
          {config.range ? (
            <FontAwesomeIcon icon={faClose} className="h-4 w-4 text-white" />
          ) : (
            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-white" />
          )}
        </DatePickerButton>
      </div>
    </div>
  );
};

import dayjs from 'dayjs';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { Button } from '../Button';

interface DatePickerProps {
  range: boolean;
  setRange: React.Dispatch<SetStateAction<boolean>>;
}
const today = dayjs().format('YYYY-MM-DD');

export const DatePickers = ({ range, setRange }) => {
  const updateQueryParams = useUpdateQuery();
  const { query } = useDelimitatedRoute();
  const { startDate, endDate } = query;

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
      updateQueryParams({ startDate: endDateInput, endDate: startDateInput }, range);
    } else {
      updateQueryParams({ startDate: startDateInput, endDate: endDateInput }, range);
    }
  };

  const handleRangeToggle = () => {
    updateQueryParams({ startDate: startDate }, !range);
    setRange(!range);
  };

  useEffect(() => {
    if (startDate && document.getElementById('start'))
      (document.getElementById('start') as HTMLInputElement).value = startDate;
    if (endDate && document.getElementById('end'))
      (document.getElementById('end') as HTMLInputElement).value = endDate;
  }, [endDate, startDate]);

  return (
    <>
      <input
        id="start"
        type="date"
        max={today}
        min={'2016-01-15'}
        onChange={handleChange}
        style={{ borderRadius: '4px', paddingTop: '4px', paddingBottom: '4px' }}
      />
      {range && (
        <>
          <p>to</p>
          <input
            id="end"
            type="date"
            max={today}
            min={'2016-01-15'}
            onChange={handleChange}
            style={{ borderRadius: '4px', paddingTop: '4px', paddingBottom: '4px' }}
          />
        </>
      )}
      <Button onClick={handleRangeToggle}>
        <p>{range ? 'X' : 'Range...'}</p>
      </Button>
    </>
  );
};

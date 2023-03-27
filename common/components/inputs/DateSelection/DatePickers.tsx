import dayjs from 'dayjs';
import { AnyNsRecord } from 'dns';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { Button } from '../Button';

interface DatePickerProps {
  config: any;
  setConfig: React.Dispatch<SetStateAction<any>>;
}
const today = dayjs().format('YYYY-MM-DD');

export const DatePickers = ({ config, setConfig }) => {
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
      updateQueryParams({ startDate: endDateInput, endDate: startDateInput }, config.range);
    } else {
      updateQueryParams({ startDate: startDateInput, endDate: endDateInput }, config.range);
    }
  };

  const handleRangeToggle = () => {
    updateQueryParams({ startDate: startDate }, !config.range);
    setConfig({ ...config, range: !config.range });
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
      {config.range && (
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
        <p>{config.range ? 'X' : 'Range...'}</p>
      </Button>
    </>
  );
};

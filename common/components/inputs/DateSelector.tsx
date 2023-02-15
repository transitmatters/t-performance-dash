import Datepicker from 'react-tailwindcss-datepicker';
import React, { useState } from 'react';
import type { DateValueType } from 'react-tailwindcss-datepicker/dist/types';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import { getCurrentDate, getOffsetDate } from '../../utils/date';
import type { QueryParams } from '../../types/router';

interface DateSelectorProps {
  range: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ range }) => {
  const {
    linePath,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const updateQueryParams = useUpdateQuery();
  const maxDate = getCurrentDate();

  const [dates, setDates] = useState<DateValueType>({
    startDate: startDate ?? null,
    endDate: endDate ?? null,
  });

  React.useEffect(() => {
    setDates({
      startDate: startDate ?? null,
      endDate: endDate ?? startDate ?? null,
    });
  }, [endDate, startDate]);

  React.useEffect(() => {
    const newDateQuery: Partial<QueryParams> = {};
    if (dates && dates.startDate && dates.endDate) {
      if (dates.startDate && typeof dates.startDate === 'string') {
        newDateQuery.startDate = getOffsetDate(dates.startDate);
      }
      if (range && dates.endDate && typeof dates.endDate === 'string') {
        newDateQuery.endDate = getOffsetDate(dates.endDate);
      } else if (!range) {
        newDateQuery.endDate = undefined;
      }
      updateQueryParams(newDateQuery);
    }
  }, [dates, range, updateQueryParams]);

  return (
    <Datepicker
      primaryColor={linePath !== 'bus' ? linePath : 'yellow'}
      value={dates}
      onChange={setDates}
      maxDate={maxDate}
      asSingle={!range}
      useRange={range}
      showShortcuts={true}
      displayFormat={'YYYY-MM-DD'}
      containerClassName={'w-auto'}
      inputClassName={'h-8'}
      i18n={'en-us'}
    />
  );
};

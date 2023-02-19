import Datepicker from 'react-tailwindcss-datepicker';
import React, { useMemo } from 'react';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import { getCurrentDate } from '../../utils/date';

interface DateSelectorProps {
  range: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ range }) => {
  const {
    linePath,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const updateQueryParams = useUpdateQuery({ range });
  const maxDate = getCurrentDate();

  const dates = useMemo(
    () => ({
      startDate: startDate ?? null,
      endDate: endDate ?? startDate ?? null,
    }),
    [startDate, endDate]
  );

  return (
    <Datepicker
      primaryColor={linePath !== 'bus' ? linePath : 'yellow'}
      value={dates}
      onChange={(evt) => updateQueryParams(evt)}
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

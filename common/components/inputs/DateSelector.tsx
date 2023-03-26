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

  const dates = useMemo(() => {
    return startDate
      ? {
          startDate: startDate,
          endDate: endDate ?? startDate,
        }
      : null;
  }, [startDate, endDate]);

  return (
    <Datepicker
      primaryColor={linePath !== 'bus' ? linePath : 'yellow'}
      value={dates}
      placeholder={range ? 'Date Range' : 'Date'}
      onChange={(evt) => updateQueryParams(evt)}
      maxDate={maxDate}
      asSingle={!range}
      useRange={range}
      showShortcuts={true}
      displayFormat={'MMM D, YYYY'}
      containerClassName={'w-auto'}
      inputClassName={'h-8'}
      i18n={'en-us'}
      configs={{
        shortcuts: range
          ? {
              pastMonth: 'Last Month',
              currentMonth: 'This Month',
              past: (period) => `Last ${period} days`,
            }
          : { today: 'Today', yesterday: 'Yesterday' },
      }}
    />
  );
};

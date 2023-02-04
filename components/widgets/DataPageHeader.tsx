import React, { useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types';
import { DATA_PAGE_NAMES } from '../../constants/datapages';
import { LINE_OBJECTS } from '../../constants/lines';
import { getCurrentDate } from '../../utils/date';
import { Button } from '../inputs/Button';
import { useDelimitatedRoute } from '../utils/router';
import { useBreakpoint } from '../utils/ScreenSize';

export const DataPageHeader = () => {
  const isDesktop = useBreakpoint('lg');

  const { linePath, datapage, line } = useDelimitatedRoute();
  const maxDate = getCurrentDate();

  const [range, setRange] = useState<boolean>(false);
  const [dates, setDates] = useState<DateValueType>({
    startDate: maxDate,
    endDate: maxDate,
  });

  // Determine the header.
  const getHeader = () => {
    if (datapage) {
      return DATA_PAGE_NAMES[datapage];
    } else if (line) {
      return LINE_OBJECTS[line]?.name;
    }
    return '';
  };

  return (
    <div className="mb-2 flex">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {getHeader()}
        </h2>
      </div>
      {isDesktop && (
        <div className="mt-4 flex flex-row gap-x-2 md:mt-0 md:ml-4">
          <Datepicker
            primaryColor={linePath !== 'bus' ? linePath : 'yellow'}
            value={dates}
            onChange={setDates}
            maxDate={maxDate}
            asSingle={!range}
            useRange={range}
            showShortcuts={true}
            containerClassName={'w-auto'}
            inputClassName={'h-8'}
          />

          <Button text={range ? '🅧' : 'Range'} onClick={() => setRange(!range)} />
        </div>
      )}
    </div>
  );
};

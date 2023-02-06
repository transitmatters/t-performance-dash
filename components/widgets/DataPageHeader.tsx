import React, { useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types';
import { LINE_OBJECTS } from '../../constants/lines';
import { getCurrentDate } from '../../utils/date';
import { Button } from '../inputs/Button';
import { DataPageTabs } from '../navigation/DataPageTabs';
import { useDelimitatedRoute } from '../utils/router';
import { useBreakpoint } from '../utils/ScreenSize';

export const DataPageHeader = () => {
  const isDesktop = useBreakpoint('lg');

  const { linePath, line } = useDelimitatedRoute();
  const maxDate = getCurrentDate();

  const [range, setRange] = useState<boolean>(false);
  const [dates, setDates] = useState<DateValueType>({
    startDate: maxDate,
    endDate: maxDate,
  });

  return (
    <div className="relative border-b border-gray-200 sm:pb-0">
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-2xl font-medium leading-6 text-gray-900 md:text-xl">
          {LINE_OBJECTS[line]?.name}
        </h3>
        <div className="mt-3 flex md:absolute md:top-3 md:right-0 md:mt-0">
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
      </div>
      <DataPageTabs />
    </div>
  );
};

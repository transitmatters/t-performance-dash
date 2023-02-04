import React, { useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types';
import { getCurrentDate } from '../../utils/date';
import { Button } from '../inputs/Button';
import { NativeDateInput } from '../inputs/NativeDateInput';
import Device from '../utils/Device';
import { Dropdown } from '../utils/Dropdown';
import { useDelimitatedRoute } from '../utils/router';

const visualizationOptions = [
  { name: 'Map', id: 1 },
  { name: 'Segments', id: 2 },
  { name: 'Totals', id: 3 },
];

export const SecondaryNavBar = () => {
  const { linePath } = useDelimitatedRoute();
  const maxDate = getCurrentDate();

  const [range, setRange] = useState<boolean>(false);
  const [dates, setDates] = useState<DateValueType>({
    startDate: maxDate,
    endDate: maxDate,
  });

  return (
    <div className="pb-safe fixed bottom-11 z-20 w-full border border-gray-300 bg-white px-2">
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white">
        <Device>
          {({ isMobile }) => {
            if (isMobile && dates) {
              return (
                <NativeDateInput
                  dateSelection={{ range, ...dates }}
                  setDateSelection={({ startDate, endDate, range }) => {
                    setRange(range);
                    setDates({ startDate, endDate });
                  }}
                />
              );
            }
            return (
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
            );
          }}
        </Device>
        <Button text={range ? '🅧' : 'Range'} onClick={() => setRange(!range)} />
        <Dropdown
          options={visualizationOptions}
          setSelectedValue={() => null}
          selectedValue={visualizationOptions[0]}
        />
      </div>
    </div>
  );
};

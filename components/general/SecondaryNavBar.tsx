import React from 'react';
import { Dropdown } from '../utils/Dropdown';

const dateOptions = [
  { name: 'Today', id: 1 },
  { name: 'Past Month', id: 2 },
  { name: 'Past Year', id: 3 },
  { name: 'All', id: 4 },
];

const visualizationOptions = [
  { name: 'Map', id: 1 },
  { name: 'Segments', id: 2 },
  { name: 'Totals', id: 3 },
];

export const SecondaryNavBar = () => {
  return (
    <div className="pb-safe fixed bottom-11 z-20 w-full border border-gray-300 bg-white px-2">
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white">
        <Dropdown
          options={dateOptions}
          setSelectedValue={() => null}
          selectedValue={dateOptions[0]}
        />
        <Dropdown
          options={visualizationOptions}
          setSelectedValue={() => null}
          selectedValue={visualizationOptions[0]}
        />
      </div>
    </div>
  );
};

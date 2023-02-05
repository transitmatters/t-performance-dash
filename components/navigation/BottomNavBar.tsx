import React from 'react';

import { LineSelectorMobile } from '../Dropdowns/LineSelectorMobile';
import { DataPageSelection } from '../general/DataPageSelection';

export const BottomNavBar = () => {
  return (
    <div className="pb-safe fixed bottom-0 z-20 w-full border border-gray-300 bg-white">
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white ">
        <LineSelectorMobile />
        <DataPageSelection />
      </div>
    </div>
  );
};

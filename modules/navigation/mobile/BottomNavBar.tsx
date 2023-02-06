import React from 'react';

import { DataPageSelection } from './DataPageSelection';
import { LineSelectorMobile } from './LineSelectorMobile';

export const BottomNavBar: React.FC = () => {
  return (
    <div className="pb-safe fixed bottom-0 z-20 w-full border border-gray-300 bg-white">
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white ">
        <LineSelectorMobile />
        <DataPageSelection />
      </div>
    </div>
  );
};

import React from 'react';

import ExploreArrow from '../../public/Icons/Components/ExploreArrow.svg';
import { LineSelector } from '../Dropdowns/LineSelector';
import { SectionSelector } from '../Dropdowns/SectionSelector';
import { DataPageSelection } from './DataPageSelection';

export const BottomNavBar = () => {
  return (
    <div className="pb-safe fixed bottom-0 z-20 w-full border border-gray-300 bg-white">
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white ">
        <LineSelector />
        <ExploreArrow className="h-3 w-auto sm:h-3" />
        <SectionSelector selectedSection={'Commute'} />
        <ExploreArrow className="relative -left-2 h-3 w-auto sm:h-3" />
        <DataPageSelection selectedSection={'Commute'} />
      </div>
    </div>
  );
};

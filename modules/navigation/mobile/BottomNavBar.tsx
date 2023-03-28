import React from 'react';
import { useDelimitatedRoute } from '../../../common/utils/router';

import { DataPageSelection } from './DataPageSelection';
import { LineSelectorMobile } from './LineSelectorMobile';
import { SecondaryNavBar } from './SecondaryNavBar';

export const BottomNavBar: React.FC = () => {
  const { datapage } = useDelimitatedRoute();
  return (
    <div className="pb-safe fixed bottom-0 z-20 w-full bg-white">
      {datapage !== 'overview' ? <SecondaryNavBar /> : null}
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white ">
        <LineSelectorMobile />
        <DataPageSelection />
      </div>
    </div>
  );
};

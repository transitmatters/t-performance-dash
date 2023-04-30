import React from 'react';
import { BUS_OVERVIEW, BUS_PAGES } from '../../common/constants/pages';
import { BusSelection } from './BusSelection';
import { SidebarTabs } from './SidebarTabs';

interface BusNavMenuProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BusNavMenu: React.FC<BusNavMenuProps> = ({ setSidebarOpen }) => {
  return (
    <>
      <BusSelection />
      <div className="mx-2 flex flex-col gap-y-4">
        <hr className="h-1 w-full border-stone-400" />
        <SidebarTabs tabs={BUS_OVERVIEW} title="Ridership" setSidebarOpen={setSidebarOpen} />
        <SidebarTabs tabs={BUS_PAGES} title="Trips" setSidebarOpen={setSidebarOpen} />
      </div>
    </>
  );
};

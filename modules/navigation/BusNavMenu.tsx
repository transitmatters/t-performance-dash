import React from 'react';
import { BUS_OVERVIEW, TRIP_PAGES } from '../../common/constants/pages';
import { BusSelection } from './BusSelection';
import { SidebarTabs } from './SidebarTabs';

interface BusNavMenuProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BusNavMenu: React.FC<BusNavMenuProps> = ({ setSidebarOpen }) => {
  return (
    <>
      <BusSelection setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col gap-y-2 px-1">
        <SidebarTabs tabs={BUS_OVERVIEW} setSidebarOpen={setSidebarOpen} />
        <SidebarTabs tabs={TRIP_PAGES} setSidebarOpen={setSidebarOpen} />
      </div>
    </>
  );
};

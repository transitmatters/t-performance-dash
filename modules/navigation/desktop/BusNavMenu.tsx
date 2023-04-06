import React from 'react';
import { BUS_OVERVIEW, BUS_PAGES } from '../../../common/constants/pages';
import { BusSelection } from './BusSelection';
import { SidebarTabs } from './SidebarTabs';

interface BusNavMenuProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BusNavMenu: React.FC<BusNavMenuProps> = ({ setSidebarOpen }) => {
  return (
    <>
      <BusSelection />
      <hr className="mt-3 h-1 w-full border-stone-400" />
      <SidebarTabs tabs={BUS_OVERVIEW} title="Ridership" setSidebarOpen={setSidebarOpen} />
      <SidebarTabs tabs={BUS_PAGES} title="Trips" setSidebarOpen={setSidebarOpen} />
    </>
  );
};

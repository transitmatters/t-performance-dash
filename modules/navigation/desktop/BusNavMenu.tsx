import React from 'react';
import { BUS_OVERVIEW, BUS_PAGES } from '../../../common/constants/pages';
import { BusSelection } from './BusSelection';
import { SidebarTabs } from './SidebarTabs';

export const BusNavMenu: React.FC = () => {
  return (
    <>
      <BusSelection />
      <hr className="mt-3 h-1 w-full border-stone-400" />
      <SidebarTabs tabs={BUS_OVERVIEW} title="Ridership" />
      <SidebarTabs tabs={BUS_PAGES} title="Trips" />
    </>
  );
};

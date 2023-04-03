import React from 'react';
import { TRIP_PAGES } from '../../../common/constants/pages';
import { BusSelection } from './BusSelection';
import { SidebarTabs } from './SidebarTabs';

export const BusNavMenu: React.FC = () => {
  return (
    <>
      <BusSelection />
      <hr className="mt-3 h-1 w-full border-stone-400" />
      <SidebarTabs tabs={TRIP_PAGES} title="Trips" />
    </>
  );
};

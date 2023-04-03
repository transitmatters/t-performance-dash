import React from 'react';
import { TRIP_PAGES } from '../../../common/constants/datapages';
import { BusSelection } from './BusSelection';
import { SidebarTabs } from './SidebarTabs';

export const BusNavMenu: React.FC = () => {
  return (
    <>
      <BusSelection />
      <SidebarTabs tabs={TRIP_PAGES} title="Trips" />
    </>
  );
};

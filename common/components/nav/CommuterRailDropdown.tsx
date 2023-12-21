import React from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { TRIP_PAGES, COMMUTER_RAIL_OVERVIEW } from '../../constants/pages';
import { CommuterRailRouteSelection } from './CommuterRailRouteSelection';

interface CommuterRailDropdownProps {
  close?: () => void;
}

export const CommuterRailDropdown: React.FC<CommuterRailDropdownProps> = ({ close }) => {
  return (
    <div className="rounded-b-md">
      <CommuterRailRouteSelection />
      <div
        className={
          'flex flex-col gap-[2px] rounded-b-md border border-t-0 border-mbta-commuterRail border-opacity-50 bg-neutral-800 px-1 py-[4px]'
        }
        role={'navigation'}
      >
        <SidebarTabs tabs={COMMUTER_RAIL_OVERVIEW} close={close} />
        <hr className="h-[1px] w-3/4 self-center border-neutral-500" />
        <SidebarTabs tabs={TRIP_PAGES} close={close} />
      </div>
    </div>
  );
};

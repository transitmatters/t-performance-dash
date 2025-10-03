import React from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { TRIP_PAGES, FERRY_OVERVIEW } from '../../constants/pages';
import { FerryRouteSelection } from './FerryRouteSelection';

interface FerryDropdownProps {
  close?: () => void;
}

export const FerryDropdown: React.FC<FerryDropdownProps> = ({ close }) => {
  return (
    <div className="rounded-b-md">
      <FerryRouteSelection />
      <div
        className={
          'flex flex-col gap-[2px] rounded-b-md border border-t-0 border-mbta-ferry border-opacity-50 bg-neutral-800 px-1 py-[4px]'
        }
        role={'navigation'}
      >
        <SidebarTabs tabs={FERRY_OVERVIEW} close={close} />
        <hr className="h-[1px] w-3/4 self-center border-neutral-500" />
        <SidebarTabs tabs={TRIP_PAGES} close={close} />
      </div>
    </div>
  );
};

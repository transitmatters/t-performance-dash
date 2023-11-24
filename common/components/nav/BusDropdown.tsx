import React from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { TRIP_PAGES, BUS_OVERVIEW } from '../../constants/pages';
import { BusRouteSelection } from './BusRouteSelection';

interface BusDropdownProps {
  close?: (
    focusableElement?:
      | HTMLElement
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.MutableRefObject<HTMLElement | null>
      | undefined
  ) => void;
}

export const BusDropdown: React.FC<BusDropdownProps> = ({ close }) => {
  return (
    <div className="rounded-b-md">
      <div>
        <BusRouteSelection />
      </div>
      <div
        className={
          'flex flex-col gap-[2px] rounded-b-md border border-t-0 border-mbta-bus  border-opacity-50 bg-neutral-800 px-1 py-[4px]'
        }
        role={'navigation'}
      >
        <SidebarTabs tabs={BUS_OVERVIEW} close={close} />
        <hr className="h-[1px] w-3/4 self-center border-neutral-500" />
        <SidebarTabs tabs={TRIP_PAGES} close={close} />
      </div>
    </div>
  );
};

import React, { SetStateAction } from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { TRIP_PAGES, BUS_OVERVIEW } from '../../constants/pages';
import { BusRouteSelection } from './BusRouteSelection';

interface BusDropdownProps {
    close?: (focusableElement?: HTMLElement | React.MouseEvent<HTMLElement, MouseEvent> | React.MutableRefObject<HTMLElement | null> | undefined) => void
}

export const BusDropdown: React.FC<BusDropdownProps> = ({ close }) => {
    return <div className="rounded-b-md">
        <div><BusRouteSelection /></div>
        <div className={"flex rounded-b-md bg-neutral-800 flex-col px-1 gap-[2px] py-[4px]  border border-t-0 border-opacity-50 border-mbta-bus"} role={'navigation'}>
            <SidebarTabs tabs={BUS_OVERVIEW} close={close} />
            <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
            <SidebarTabs tabs={TRIP_PAGES} close={close} />
        </div>
    </div>
}
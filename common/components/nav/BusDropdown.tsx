import React from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { TRIP_PAGES, BUS_OVERVIEW } from '../../constants/pages';
import { BusRouteSelection } from './BusRouteSelection';

export const BusDropdown: React.FC = () => {
    return <div className="rounded-b-md border border-t-0 border-opacity-50 border-mbta-bus">
        <div><BusRouteSelection /></div>
        <div className={"flex rounded-b-md bg-neutral-800 flex-col px-1 gap-[2px] py-[4px]"} role={'navigation'}>
            <SidebarTabs tabs={BUS_OVERVIEW} />
            <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
            <SidebarTabs tabs={TRIP_PAGES} />
        </div>
    </div>
}
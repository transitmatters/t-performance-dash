import React from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { OVERVIEW_PAGE, LINE_PAGES, TRIP_PAGES } from '../../constants/pages';

export const SubwayDropdown: React.FC = ({ }) => {
    return <div className={"flex rounded-b-md bg-neutral-800 flex-col px-1 gap-[2px] py-[4px]"} role={'navigation'}>
        <SidebarTabs tabs={OVERVIEW_PAGE} />
        <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
        <SidebarTabs tabs={LINE_PAGES} />
        <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
        <SidebarTabs tabs={TRIP_PAGES} />
    </div>
}
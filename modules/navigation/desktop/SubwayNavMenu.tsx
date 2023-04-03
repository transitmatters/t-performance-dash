import React from 'react';
import { LINE_PAGES, MORE_PAGES, TODAY, TRIP_PAGES } from '../../../common/constants/datapages';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { LineSelection } from './LineSelection';
import { SidebarTabs } from './SidebarTabs';

// TODO: this already exists elsewhere
const LINE_ITEMS = [LINE_OBJECTS['RL'], LINE_OBJECTS['OL'], LINE_OBJECTS['GL'], LINE_OBJECTS['BL']];
export const SubwayNavMenu = () => (
  <>
    <LineSelection lineItems={LINE_ITEMS} />
    <hr className="mt-3 h-1 w-full border-stone-400" />
    <div className="mx-2 mt-3 flex flex-col gap-y-7">
      <SidebarTabs tabs={TODAY} title="Today" />
      <SidebarTabs tabs={LINE_PAGES} title="Line" />
      <SidebarTabs tabs={TRIP_PAGES} title="Trips" />
      <SidebarTabs tabs={MORE_PAGES} title={'More'} />
    </div>
  </>
);

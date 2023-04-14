import React from 'react';
import { LINE_PAGES, TODAY, TRIP_PAGES } from '../../common/constants/pages';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { LineSelection } from './LineSelection';
import { SidebarTabs } from './SidebarTabs';

interface SubwayNavMenuProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LINE_ITEMS = [
  LINE_OBJECTS['line-red'],
  LINE_OBJECTS['line-orange'],
  LINE_OBJECTS['line-blue'],
  LINE_OBJECTS['line-green'],
];
export const SubwayNavMenu: React.FC<SubwayNavMenuProps> = ({ setSidebarOpen }) => (
  <>
    <LineSelection lineItems={LINE_ITEMS} />
    <hr className="mt-3 h-1 w-full border-stone-400" />
    <div className="mx-2 mt-3 flex flex-col gap-y-7">
      <SidebarTabs tabs={TODAY} title="Today" setSidebarOpen={setSidebarOpen} />
      <SidebarTabs tabs={LINE_PAGES} title="Line" setSidebarOpen={setSidebarOpen} />
      <SidebarTabs tabs={TRIP_PAGES} title="Trips" setSidebarOpen={setSidebarOpen} />
    </div>
  </>
);

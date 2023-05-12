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
    <LineSelection lineItems={LINE_ITEMS} setSidebarOpen={setSidebarOpen} />
    <div className="mx-2 flex flex-col gap-y-4">
      <hr className="h-1 w-full border-stone-400" />
      <SidebarTabs tabs={TODAY} setSidebarOpen={setSidebarOpen} />
      <SidebarTabs tabs={LINE_PAGES} setSidebarOpen={setSidebarOpen} />
      <SidebarTabs tabs={TRIP_PAGES} setSidebarOpen={setSidebarOpen} />
    </div>
  </>
);

import React from 'react';
import { LANDING_PAGE, SYSTEM_SLOWZONES_PAGE } from '../../common/constants/pages';
import { SidebarTabs } from './SidebarTabs';

interface SystemNavMenuProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}
export const SystemNavMenu = ({ setSidebarOpen }: SystemNavMenuProps) => {
  return (
    <div className="flex flex-col gap-y-2 px-1" role={'navigation'}>
      <SidebarTabs tabs={LANDING_PAGE} setSidebarOpen={setSidebarOpen} />
      <SidebarTabs tabs={SYSTEM_SLOWZONES_PAGE} setSidebarOpen={setSidebarOpen} />
    </div>
  );
};

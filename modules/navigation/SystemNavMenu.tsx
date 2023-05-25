import React from 'react';
import { SYSTEM_PAGES } from '../../common/constants/pages';
import { SidebarTabs } from './SidebarTabs';

interface SystemNavMenuProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}
export const SystemNavMenu = ({ setSidebarOpen }: SystemNavMenuProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <hr className="h-1 w-full border-stone-400" />
      <SidebarTabs tabs={SYSTEM_PAGES} setSidebarOpen={setSidebarOpen} />
    </div>
  );
};

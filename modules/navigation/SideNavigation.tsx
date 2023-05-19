import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Tab } from '../../common/types/router';
import { DashboardSelection } from './DashboardSelection';
import { BusNavMenu } from './BusNavMenu';
import { SubwayNavMenu } from './SubwayNavMenu';
import { SystemNavMenu } from './SystemNavMenu';

interface SideNavigationProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ setSidebarOpen }) => {
  const getNavMenu = (tab: Tab) => {
    if (tab === 'Subway') return <SubwayNavMenu setSidebarOpen={setSidebarOpen} />;
    if (tab === 'Bus') return <BusNavMenu setSidebarOpen={setSidebarOpen} />;
    if (tab === 'System') return <SystemNavMenu setSidebarOpen={setSidebarOpen} />;
  };
  const { tab } = useDelimitatedRoute();
  return (
    <nav className="flex flex-1 flex-col pb-3 md:px-4 md:pb-0 md:pt-5">
      <ul role="list" className="flex flex-1 flex-col gap-y-5">
        <DashboardSelection />
        {getNavMenu(tab)}
      </ul>
    </nav>
  );
};

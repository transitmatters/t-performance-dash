import React from 'react';
import { useDelimitatedRoute } from '../../../common/utils/router';
import type { Tab } from '../../../common/types/router';
import { DashboardSelection } from './DashboardSelection';
import { SubwayNavMenu } from './SubwayNavMenu';
import { BusNavMenu } from './BusNavMenu';

interface SideNavigationProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const getNavMenu = (tab: Tab) => {
  if (tab === 'Subway') return <SubwayNavMenu />;
  if (tab === 'Bus') return <BusNavMenu />;
};

export const SideNavigation = ({ setSidebarOpen }: SideNavigationProps) => {
  const { tab } = useDelimitatedRoute();
  return (
    <nav className="flex flex-1 flex-col px-4">
      <ul role="list" className="flex flex-1 flex-col gap-y-5">
        <DashboardSelection />
        {getNavMenu(tab)}
      </ul>
    </nav>
  );
};

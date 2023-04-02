import React from 'react';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { LineSelection } from './LineSelection';
import { SidebarTabs } from './SidebarTabs';

export interface NavItem {
  name: string;
  key: string;
  path?: string;
  icon?: IconDefinition;
  current?: boolean;
  children?: NavItem[];
}

interface SideNavigationProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}
const LINE_ITEMS = [
  {
    name: 'Red Line',
    key: 'RL',
    path: '/red',
  },
  {
    name: 'Orange Line',
    key: 'OL',
    path: '/orange',
  },
  {
    name: 'Green Line',
    key: 'GL',
    path: '/green',
  },
  {
    name: 'Blue Line',
    key: 'BL',
    path: '/blue',
  },
];

export const LH_TABS = [
  { name: 'Overview', keys: 'OV', path: '' },
  { name: 'Slow Zones', keys: 'SZ', path: '/slowzones' },
  { name: 'Ridership', key: 'RS', path: '/ridership' },
  { name: 'Headways', key: 'HW', path: '/headways' },
];

export const TE_TABS = [
  { name: 'Single Day', keys: 'SD', path: '/trips' },
  { name: 'Range', keys: 'RANGE', path: '/trips' },
];

export const MORE_TABS = [{ name: 'New Train Tracker', keys: 'NTT', path: '/' }];

export const SideNavigation = ({ setSidebarOpen }: SideNavigationProps) => {
  return (
    <nav className="flex flex-1 flex-col px-4">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <LineSelection lineItems={LINE_ITEMS} />
        <SidebarTabs tabs={LH_TABS} title="Line View" />
        <SidebarTabs tabs={TE_TABS} title={'Trip Explorer'} />
        <SidebarTabs tabs={MORE_TABS} title={'More'} />
      </ul>
    </nav>
  );
};

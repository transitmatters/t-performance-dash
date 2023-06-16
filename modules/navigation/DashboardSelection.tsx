import React from 'react';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import Link from 'next/link';
import { DASHBOARD_TABS } from '../../common/constants/dashboardTabs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useDateStore } from '../../common/state/dateStore';
import { useStationStore } from '../../common/state/stationStore';

export const DashboardSelection: React.FC = () => {
  const { tab } = useDelimitatedRoute();
  const setStationStore = useStationStore((state) => state.setStationStore);
  const swapDashboardTabs = useDateStore((state) => state.swapDashboardTabs);
  const dashboardTabs = Object.values(DASHBOARD_TABS);
  const handleChange = (name) => {
    setStationStore({ from: undefined, to: undefined });
    swapDashboardTabs(name);
  };
  return (
    <Tab.Group
      manual
      onChange={(index) => {
        handleChange(dashboardTabs[index].name);
      }}
      selectedIndex={dashboardTabs.findIndex((currTab) => tab === currTab.name)}
    >
      <Tab.List className="space-between flex h-10 w-full flex-row md:h-7">
        {dashboardTabs.map((tab, index) => (
          <Tab key={tab.name} className="h-full w-full" disabled={tab.disabled}>
            {({ selected }) => (
              <Link
                href={{ pathname: dashboardTabs[index].path, query: dashboardTabs[index].query }}
                onClick={() => handleChange(tab.name)}
                className={classNames(
                  ' flex h-full items-center justify-center border border-stone-200 py-1 text-sm ',
                  selected && 'bg-stone-200 text-stone-900',
                  index === 0 && 'rounded-l-md',
                  index === dashboardTabs.length - 1 && 'rounded-r-md',
                  tab.disabled
                    ? 'text-stone-500'
                    : 'cursor-pointer hover:bg-stone-200 hover:bg-opacity-80 hover:text-stone-800'
                )}
              >
                <p>{tab.name}</p>
              </Link>
            )}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
};

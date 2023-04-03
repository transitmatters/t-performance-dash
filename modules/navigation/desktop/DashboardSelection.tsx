import React from 'react';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { DASHBOARD_TABS } from '../../../common/constants/dashboardTabs';
import { useDelimitatedRoute } from '../../../common/utils/router';

const tabs = ['Subway', 'Bus', 'System'];

export const DashboardSelection = () => {
  const { tab } = useDelimitatedRoute();
  const router = useRouter();
  const dashboardTabs = Object.values(DASHBOARD_TABS);
  return (
    <Tab.Group
      manual
      onChange={(index) => {
        router.push(dashboardTabs[index].path);
      }}
      selectedIndex={dashboardTabs.findIndex((currTab) => tab === currTab.name)}
    >
      <Tab.List className="space-between flex w-full flex-row">
        {dashboardTabs.map((tab, index) => (
          <Tab key={tab.name} className="w-full">
            {({ selected }) => (
              <div
                className={classNames(
                  'flex items-center justify-center border border-stone-200 py-1 text-sm font-semibold hover:bg-stone-200 hover:bg-opacity-80 hover:text-stone-800',
                  selected && 'bg-stone-200 text-stone-900',
                  index === 0 && 'rounded-l-md',
                  index === tabs.length - 1 && 'rounded-r-md'
                )}
              >
                <p>{tab.name}</p>
              </div>
            )}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
};

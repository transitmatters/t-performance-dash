import classNames from 'classnames';
import React from 'react';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useDashboardConfig } from '../../common/state/dashboardConfig';
import { switchToRange, switchToSingleDay } from './utils/rangeTabUtils';

export const RangeTabs = () => {
  const route = useDelimitatedRoute();
  const { query, line } = route;
  const router = useRouter();
  const dashboardConfig = useDashboardConfig();
  const selected = query.queryType === 'single' ? 1 : 0;
  const rangeOptions = ['Multi Day', 'Single Day'];

  const handleChange = (index: number) => {
    if (index) {
      switchToSingleDay(router, dashboardConfig);
      return;
    }
    switchToRange(router, dashboardConfig);
  };

  return (
    <div className="bottom-0 flex items-end pt-4 md:pt-0">
      <Tab.Group selectedIndex={selected} onChange={handleChange}>
        <Tab.List className="flex">
          {rangeOptions.map(
            (range) =>
              line && (
                <Tab key={range}>
                  {({ selected }) => (
                    <div
                      className={classNames(
                        `select-none whitespace-nowrap border-white px-4 pb-2 text-xs font-medium text-stone-100 focus:outline-none focus:ring-0 md:text-sm`,
                        selected ? 'border-b-2' : 'border-b-0 text-stone-200 '
                      )}
                    >
                      {range}
                    </div>
                  )}
                </Tab>
              )
          )}
        </Tab.List>
      </Tab.Group>
    </div>
  );
};

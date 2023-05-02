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
      <Tab.Group selectedIndex={selected} onChange={handleChange} manual>
        <Tab.List className="flex">
          {rangeOptions.map(
            (range) =>
              line && (
                <Tab
                  key={range}
                  className={'focus:bg-white focus:bg-opacity-20 focus:outline-none'}
                >
                  {({ selected }) => (
                    <div
                      className={classNames(
                        `select-none whitespace-nowrap border-white px-4 py-1 text-xs font-medium text-white md:text-sm`,
                        selected ? 'border-b-2 text-opacity-95' : 'border-b-0 text-opacity-90'
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

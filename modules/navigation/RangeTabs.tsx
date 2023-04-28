import classNames from 'classnames';
import React from 'react';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineColorBorder } from '../../common/styles/general';
import { useDashboardConfig } from '../../common/state/dashboardConfig';
import { switchToRange, switchToSingleDay } from './utils/rangeTabUtils';

export const RangeTabs = () => {
  const route = useDelimitatedRoute();
  const { query, line } = route;
  const router = useRouter();
  const dashboardConfig = useDashboardConfig();
  const selected = query.queryType === 'single' ? 1 : 0;
  const rangeOptions = ['Aggregate', 'Daily'];

  const handleChange = (index: number) => {
    if (index) {
      switchToSingleDay(router, dashboardConfig);
      return;
    }
    switchToRange(router, dashboardConfig);
  };

  return (
    <div className="mt-4">
      <div>
        <Tab.Group selectedIndex={selected} onChange={handleChange}>
          <Tab.List className="flex">
            {rangeOptions.map(
              (range) =>
                line && (
                  <Tab key={range}>
                    {({ selected }) => (
                      <div
                        className={classNames(
                          `select-none whitespace-nowrap border-b-2 px-4 pb-4 text-sm font-medium focus:outline-none focus:ring-0`,
                          selected
                            ? lineColorBorder[line ?? 'DEFAULT']
                            : 'border-transparent text-gray-600 '
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
    </div>
  );
};

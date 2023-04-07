import classNames from 'classnames';
import React from 'react';
import { pickBy } from 'lodash';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineColorBorder } from '../../common/styles/general';

export const RangeTabs = () => {
  const route = useDelimitatedRoute();
  const { query, linePath, lineShort, line, page } = route;
  const router = useRouter();

  const range = [
    { name: 'Range', selected: true },
    { name: 'Single Day', selected: false },
  ];

  return (
    <div className="md:mt-4">
      <div className="hidden sm:block">
        <Tab.Group
          onChange={(value) => {
            router.push({
              pathname: `/${linePath}`,
              query: pickBy(query, (attr) => attr !== undefined),
            });
          }}
        >
          <Tab.List className="flex">
            {range.map(
              (range) =>
                line && (
                  <Tab key={range.name}>
                    {({ selected }) => (
                      <div
                        className={classNames(
                          `select-none whitespace-nowrap border-b-2 px-4 pb-4 text-sm font-medium focus:outline-none focus:ring-0`,
                          range.selected
                            ? lineColorBorder[line ?? 'DEFAULT']
                            : 'border-transparent text-gray-600 '
                        )}
                      >
                        {range.name}
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

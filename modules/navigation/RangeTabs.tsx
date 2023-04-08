import classNames from 'classnames';
import React from 'react';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineColorBorder } from '../../common/styles/general';
import { ONE_WEEK_AGO_STRING, TODAY_STRING } from '../../common/constants/dates';

export const RangeTabs = () => {
  const route = useDelimitatedRoute();
  const { query, line } = route;
  const router = useRouter();

  const selected = query.single === 'yes' ? 1 : 0;

  const range = [
    { name: 'Range', selected: true },
    { name: 'Single Day', selected: false },
  ];

  const handleChange = (index: number) => {
    if (index) {
      router.query.single = 'yes';
      router.query.startDate = router.query.endDate;
      delete router.query.endDate;
      router.push(router);
      return;
    }
    if (query.startDate === TODAY_STRING) {
      router.query.startDate = ONE_WEEK_AGO_STRING;
      router.query.endDate = TODAY_STRING;
    }
    delete router.query.single;
    router.push(router);
  };

  return (
    <div className="md:mt-4">
      <div className="hidden sm:block">
        <Tab.Group selectedIndex={selected} onChange={handleChange}>
          <Tab.List className="flex">
            {range.map(
              (range) =>
                line && (
                  <Tab key={range.name}>
                    {({ selected }) => (
                      <div
                        className={classNames(
                          `select-none whitespace-nowrap border-b-2 px-4 pb-4 text-sm font-medium focus:outline-none focus:ring-0`,
                          selected
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

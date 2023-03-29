import classNames from 'classnames';
import React from 'react';
import { pickBy } from 'lodash';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { DATA_PAGES } from '../../../common/constants/datapages';
import { lineColorBorder } from '../../../common/styles/general';

export const DataPageTabs = () => {
  const route = useDelimitatedRoute();
  const { query, linePath, lineShort, line, datapage } = route;
  const router = useRouter();
  const dataPageEntries = Object.entries(DATA_PAGES);

  return (
    <div className="md:mt-4">
      <div className="hidden sm:block">
        <Tab.Group
          selectedIndex={dataPageEntries.findIndex(([key]) => key === datapage)}
          onChange={(value) => {
            const [, page] = dataPageEntries[value];
            router.push({
              pathname: `/${linePath}${page.href}`,
              query: pickBy(query, (attr) => attr !== undefined),
            });
          }}
        >
          <Tab.List className="flex">
            {dataPageEntries.map(
              ([key, page]) =>
                line && (
                  <Tab key={key} disabled={!page.lines.includes(line)}>
                    {({ selected }) => (
                      <div
                        title={
                          page.lines.includes(line)
                            ? DATA_PAGES[key].name
                            : `${DATA_PAGES[key].name} not available for ${lineShort}.`
                        }
                        className={classNames(
                          `select-none whitespace-nowrap border-b-2 px-4 pb-4 text-sm font-medium focus:outline-none focus:ring-0`,
                          page.lines.includes(line)
                            ? 'cursor-pointer hover:border-gray-300 hover:text-gray-700'
                            : 'cursor-select text-opacity-40',
                          selected
                            ? lineColorBorder[line ?? 'DEFAULT']
                            : 'border-transparent text-gray-600 '
                        )}
                      >
                        {page.name}
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

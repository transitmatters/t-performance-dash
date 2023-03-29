import classNames from 'classnames';
import React from 'react';
import { pickBy } from 'lodash';
import {
  getBusRouteSelectionItemHref,
  getLineSelectionItemHref,
  useDelimitatedRoute,
} from '../../../common/utils/router';
import { DATA_PAGES } from '../../../common/constants/datapages';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { lineColorBackground, lineColorBorder } from '../../../common/styles/general';
import { buttonHighlightConfig } from '../../../common/components/inputs/styles/inputStyle';

export const DataPageTabs = () => {
  const route = useDelimitatedRoute();
  const { query, linePath, line, datapage } = route;
  const router = useRouter();

  return (
    <div className="md:mt-4">
      <div className="hidden sm:block">
        <Tab.Group
          onChange={(value) => {
            const [key, page] = Object.entries(DATA_PAGES)[value];
            router.push({
              pathname: `/${linePath}${page.href}`,
              query: pickBy(query, (attr) => attr !== undefined),
            });
          }}
        >
          <Tab.List className="flex">
            {Object.entries(DATA_PAGES).map(
              ([key, page]) =>
                line && (
                  <Tab key={key} disabled={!page.lines.includes(line)}>
                    {({ selected }) => (
                      <div
                        title={
                          page.lines.includes(line)
                            ? DATA_PAGES[key].name
                            : `${DATA_PAGES[key].name} not available for ${linePath}`
                        }
                        className={classNames(
                          `select-none whitespace-nowrap border-b-2 px-4 pb-4 text-sm font-medium`,
                          page.lines.includes(line)
                            ? 'cursor-pointer hover:border-gray-300 hover:text-gray-700'
                            : 'cursor-select text-opacity-40',
                          selected && lineColorBorder[line ?? 'DEFAULT'],
                          datapage !== key && 'border-transparent text-gray-600 '
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

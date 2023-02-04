import classNames from 'classnames';
import React from 'react';
import { DATA_PAGES } from '../../constants/datapages';
import { LINE_OBJECTS } from '../../constants/lines';
import { ActiveLink } from '../utils/ActiveLink';
import { useDelimitatedRoute } from '../utils/router';

export const DataPageTabs = () => {
  const { datapage, line } = useDelimitatedRoute();

  return (
    <div className="mt-4">
      <div className="sm:hidden">
        <label htmlFor="current-tab" className="sr-only">
          Select a tab
        </label>
        <select
          id="current-tab"
          name="current-tab"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          defaultValue={'overview'}
        >
          {Object.entries(DATA_PAGES).map(([key, page]) => (
            <option value={key} key={page.name}>
              <ActiveLink
                key={key}
                href={`/${LINE_OBJECTS[line]?.path}${page.href}`}
                activeClassName={'border-gray-500 text-black'}
                lambda={() => {
                  return key === datapage;
                }}
              >
                <div> {page.name}</div>
              </ActiveLink>
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(DATA_PAGES).map(([key, page]) => (
            <ActiveLink
              key={key}
              href={`/${LINE_OBJECTS[line]?.path}${page.href}`}
              activeClassName={'border-gray-500 text-black'}
              lambda={() => {
                return key === datapage;
              }}
            >
              <div
                className={classNames(
                  `whitespace-nowrap border-b-2 ${
                    datapage !== key &&
                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }  whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium`
                )}
              >
                {page.name}
              </div>
            </ActiveLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

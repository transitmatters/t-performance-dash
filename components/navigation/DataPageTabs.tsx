import classNames from 'classnames';
import React from 'react';
import { DATA_PAGES } from '../../constants/datapages';
import { LINE_OBJECTS } from '../../constants/lines';
import { ActiveLink } from '../utils/ActiveLink';
import { useDelimitatedRoute } from '../utils/router';

export const DataPageTabs = () => {
  const { datapage, line } = useDelimitatedRoute();

  return (
    <div className="md:mt-4">
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

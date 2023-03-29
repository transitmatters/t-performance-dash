import classNames from 'classnames';
import React from 'react';
import { pickBy } from 'lodash';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { DATA_PAGES } from '../../../common/constants/datapages';
import { ActiveLink } from '../../../common/components/general/ActiveLink';

export const DataPageTabs = () => {
  const { datapage, line, linePath, query } = useDelimitatedRoute();

  return (
    <div className="md:mt-4">
      <div className="hidden sm:block">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(DATA_PAGES).map(
            ([key, page]) =>
              line &&
              page.lines.includes(line) && (
                <ActiveLink
                  key={key}
                  href={{
                    pathname: `/${linePath}${page.href}`,
                    query: pickBy(query, (attr) => attr !== undefined),
                  }}
                  activeClassName={'border-gray-500 text-black'}
                  lambda={() => {
                    return key === datapage;
                  }}
                >
                  <div
                    className={classNames(
                      `cursor-pointer select-none whitespace-nowrap border-b-2 ${
                        datapage !== key &&
                        'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }  whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium`
                    )}
                  >
                    {page.name}
                  </div>
                </ActiveLink>
              )
          )}
        </nav>
      </div>
    </div>
  );
};

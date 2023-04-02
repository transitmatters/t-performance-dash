import React from 'react';

import { useRouter } from 'next/router';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrainSubway } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../../common/utils/router';

export const SidebarTabsTop = ({ tabs }) => {
  const { linePath } = useDelimitatedRoute();
  const router = useRouter();
  return (
    <div>
      <ul role="list" className="-mx-2 space-y-1">
        {tabs.map((tab) => (
          <li key={tab.name}>
            <a
              onClick={() => router.push({ pathname: `/${linePath}${tab.path}` })}
              className={classNames(
                false
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
              )}
            >
              <FontAwesomeIcon
                icon={faTrainSubway}
                className="h-6 w-6 shrink-0"
                aria-hidden="true"
              />
              {tab.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

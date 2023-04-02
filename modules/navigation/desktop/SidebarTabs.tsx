import classNames from 'classnames';
import React from 'react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../../common/utils/router';

export const SidebarTabs = ({ title, tabs }) => {
  const router = useRouter();
  const { linePath } = useDelimitatedRoute();
  return (
    <div>
      <div className="text-xs font-semibold leading-6 text-gray-400">{title}</div>
      <ul role="list" className="-mx-2 mt-2 space-y-1">
        {tabs.map((tab) => (
          <li key={tab.name}>
            <a
              onClick={() => {
                router.push({ pathname: `/${linePath}${tab.path}` });
              }}
              className={classNames(
                tab.current
                  ? 'bg-gray-800 text-white'
                  : 'text-stone-300 hover:bg-gray-800 hover:text-white',
                'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                {tab.initial}
              </span>
              <span className="truncate">{tab.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

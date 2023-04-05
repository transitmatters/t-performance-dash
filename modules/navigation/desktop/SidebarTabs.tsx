import classNames from 'classnames';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import {
  handlePageNavigation,
  useDelimitatedRoute,
  useSelectedPage,
} from '../../../common/utils/router';
import type { NavTab } from '../../../common/constants/pages';

interface SidebarTabs {
  tabs: NavTab[];
  title: string;
}

export const SidebarTabs: React.FC<SidebarTabs> = ({ title, tabs }) => {
  const { linePath, line, query, page } = useDelimitatedRoute();
  const router = useRouter();
  const selectedPage = useSelectedPage();

  const handleChange = (enabled: boolean, tab: NavTab) => {
    if (!enabled) return null;
    handlePageNavigation(page, tab, query, linePath, router);
  };

  return (
    <div>
      <div className="text-xs font-semibold leading-6 text-stone-400">{title}</div>
      <ul role="list" className={`-mx-2 mt-2 space-y-1`}>
        {tabs.map((tab: NavTab) => {
          const enabled = line ? tab.lines.includes(line) : true;
          const selected = selectedPage === tab.key;
          return (
            <li key={tab.name}>
              <a
                tabIndex={enabled ? 0 : undefined}
                onKeyUp={(e) => {
                  if (e.key === 'enter' || e.key == ' ') handleChange(enabled, tab);
                }}
                onClick={() => handleChange(enabled, tab)}
                className={classNames(
                  selected
                    ? 'bg-stone-700 text-white'
                    : enabled && 'text-stone-300 hover:bg-stone-800 hover:text-white',
                  'group flex select-none items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                  enabled ? 'cursor-pointer' : 'cursor-default  text-stone-600',
                  tab.sub && 'ml-4 text-xs'
                )}
              >
                <FontAwesomeIcon
                  icon={tab.icon}
                  aria-hidden={true}
                  className={classNames(
                    selected ? 'text-white' : 'text-stone-200 ',
                    enabled ? 'group-hover:text-white' : 'text-stone-600',
                    'shrink-0',
                    tab.sub ? 'h-4 w-4' : 'h-6 w-6'
                  )}
                />
                <span className="truncate">{tab.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

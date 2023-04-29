import classNames from 'classnames';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDelimitatedRoute, useHandlePageNavigation } from '../../common/utils/router';
import type { PageMetadata } from '../../common/constants/pages';

interface SidebarTabs {
  tabs: PageMetadata[];
  title: string;
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidebarTabs: React.FC<SidebarTabs> = ({ title, tabs, setSidebarOpen }) => {
  const { line, page } = useDelimitatedRoute();

  const handlePageNavigation = useHandlePageNavigation();

  const handleChange = (enabled: boolean, tab: PageMetadata) => {
    if (!enabled) return null;
    handlePageNavigation(tab);
    setSidebarOpen && setSidebarOpen(false);
  };

  return (
    <div className="rounded-md bg-white bg-opacity-5 p-1">
      {/* <div className="text-xs font-semibold leading-6 text-stone-400">{title}</div> */}
      <ul role="list" className={`space-y-1`}>
        {tabs.map((tab: PageMetadata) => {
          const enabled = line ? tab.lines.includes(line) : true;
          const selected = page === tab.key;
          return (
            <li key={tab.key}>
              <a
                tabIndex={enabled ? 0 : undefined}
                onKeyUp={(e) => {
                  if (e.key === 'enter' || e.key == ' ') handleChange(enabled, tab);
                }}
                onClick={() => handleChange(enabled, tab)}
                className={classNames(
                  selected
                    ? 'bg-stone-900 text-white'
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
                    selected ? 'text-white' : 'text-stone-200',
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

import classNames from 'classnames';
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useDelimitatedRoute,
  useGenerateHref,
  useHandleConfigStore,
} from '../../common/utils/router';
import type { PageMetadata } from '../../common/constants/pages';

interface SidebarTabs {
  tabs: PageMetadata[];
  close?: () => void;
}

export const SidebarTabs: React.FC<SidebarTabs> = ({ tabs, close }) => {
  const { line, page, query, linePath } = useDelimitatedRoute();
  const handlePageConfig = useHandleConfigStore();
  const generateHref = useGenerateHref();

  const handleChange = (enabled: boolean, tab: PageMetadata) => {
    if (!enabled) return null;
    handlePageConfig(tab);
    if (close) {
      close();
    }
  };

  return (
    <div className="px-1" role={'navigation'}>
      <ul>
        {tabs.map((tab: PageMetadata) => {
          const enabled = line ? tab.lines.includes(line) : true;
          const selected = page === tab.key;
          const href = generateHref(tab, page, query, linePath);
          return (
            <li key={tab.key}>
              <Link
                href={href}
                tabIndex={enabled ? 0 : undefined}
                onKeyUp={(e) => {
                  if (e.key === 'enter' || e.key === ' ') handleChange(enabled, tab);
                }}
                onClick={() => handleChange(enabled, tab)}
                className={classNames(
                  selected
                    ? 'bg-stone-900 text-white'
                    : enabled && 'text-stone-300 hover:bg-stone-800 hover:text-white',
                  'group flex select-none items-center gap-x-3 rounded-sm py-1.5 pl-2 text-sm font-semibold leading-6',
                  enabled ? 'cursor-pointer' : 'cursor-default text-stone-600'
                )}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span className="truncate">{tab.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

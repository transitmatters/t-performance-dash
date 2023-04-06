import React from 'react';
import { Listbox } from '@headlessui/react';
import classNames from 'classnames';
import router from 'next/router';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getBusRouteSelectionItemHref,
  getLineSelectionItemHref,
  useDelimitatedRoute,
} from '../../../common/utils/router';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { LinesDropdownItem } from './LinesDropdownItem';
import { BusDropdownItem } from './BusDropdownItem';

export interface NavItem {
  name: string;
  key: string;
  path?: string;
  icon?: IconDefinition;
  current?: boolean;
  children?: NavItem[];
}

interface SideNavigationProps {
  items: NavItem[];
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideNavigation = ({ items, setSidebarOpen }: SideNavigationProps) => {
  const route = useDelimitatedRoute();
  return (
    <nav className="flex flex-1 flex-col gap-y-2" aria-label="Sidebar">
      {items.map((item) =>
        !item.children ? (
          <div key={item.name}>
            <a
              href={`/${item.path}`}
              className={classNames(
                item.name === route.tab
                  ? `border-l-4 bg-opacity-20`
                  : ' text-stone-600 hover:bg-stone-500 hover:text-stone-900',
                'group flex w-full cursor-pointer items-center rounded-md py-2 pl-7 pr-2 text-sm font-medium'
              )}
            >
              {item.name}
            </a>
          </div>
        ) : (
          <Listbox
            as="div"
            key={item.name}
            className="space-y-1"
            value={
              route.line === 'line-bus' && route.query.busRoute ? route.query.busRoute : route.line
            }
            onChange={(value) => {
              setSidebarOpen && setSidebarOpen(false);
              if (item.name === 'Bus') {
                router.push(getBusRouteSelectionItemHref(value, route));
              } else {
                router.push(getLineSelectionItemHref(LINE_OBJECTS[value], route));
              }
            }}
          >
            {({ open }) => (
              <>
                <Listbox.Button
                  className={classNames(
                    open ? ' bg-stone-200 text-stone-900' : ' text-white  hover:text-stone-900',
                    'group flex w-full cursor-pointer items-center rounded-md py-2  pr-2 text-left text-sm font-medium hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-600',
                    item.name === route.tab && !open && 'bg-stone-900'
                  )}
                >
                  {item.icon && (
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={classNames('ml-1 mr-3 h-6 w-6 flex-shrink-0 pl-2')}
                      size={'sm'}
                    />
                  )}

                  <span className="flex-1">{item.name}</span>
                  <svg
                    className={classNames(
                      open ? 'rotate-90 text-stone-400' : 'text-stone-300',
                      'ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-stone-400'
                    )}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                  </svg>
                </Listbox.Button>
                {item.name === 'Bus' && <BusDropdownItem item={item} />}
                {item.name === 'Subway' && <LinesDropdownItem item={item} />}
              </>
            )}
          </Listbox>
        )
      )}
    </nav>
  );
};

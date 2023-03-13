import React, { Fragment } from 'react';
import { Listbox } from '@headlessui/react';
import classNames from 'classnames';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../../common/utils/router';
import { buttonConfig, lineSelectionConfig } from '../styles/lineSelector';
import router from 'next/router';
import { LINE_OBJECTS } from '../../../common/constants/lines';

interface NavItem {
  name: string;
  path: string;
  key: string;
  icon?: any;
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
    <nav className="flex-1" aria-label="Sidebar">
      {items.map((item) =>
        !item.children ? (
          <div key={item.name}>
            <a
              href={`/${item.path}`}
              className={classNames(
                item.current
                  ? `border-l-4 bg-opacity-20`
                  : ' text-gray-600 hover:bg-gray-50 hover:text-gray-900',
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
            value={route.line}
            onChange={(value) => {
              setSidebarOpen && setSidebarOpen(false);
              router.push(getLineSelectionItemHref(LINE_OBJECTS[value], route));
            }}
          >
            {({ open }) => (
              <>
                <Listbox.Button
                  className={classNames(
                    item.current
                      ? ' text-white'
                      : ' text-white hover:bg-gray-50 hover:text-gray-900',
                    'group flex w-full cursor-pointer items-center rounded-md  py-2 pr-2 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-600'
                  )}
                >
                  <item.icon
                    className="ml-1 mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  <svg
                    className={classNames(
                      open ? 'rotate-90 text-gray-400' : 'text-gray-300',
                      'ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400'
                    )}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                  </svg>
                </Listbox.Button>
                {item.children && (
                  <Listbox.Options className="space-y-1">
                    {item.children.map((subItem) => (
                      <Listbox.Option key={subItem.name} as={Fragment} value={subItem.key}>
                        {({ active, selected }) => (
                          <span
                            className={classNames(
                              'group flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm font-medium',
                              selected &&
                                `${lineSelectionConfig[subItem.key]} ${
                                  buttonConfig[subItem.key]
                                } text-white`,
                              active && !selected && 'bg-design-rb-800',
                              active && selected && 'bg-opacity-90',
                              'cursor-pointer hover:text-white '
                            )}
                          >
                            {subItem.name}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                )}
              </>
            )}
          </Listbox>
        )
      )}
    </nav>
  );
};

import { Disclosure } from '@headlessui/react';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { buttonConfig, lineSelectionConfig } from '../Dropdowns/LineSelectorStyle';
import { ActiveLink } from '../utils/ActiveLink';
import { useDelimitatedRoute } from '../utils/router';

interface NavItem {
  href: string;
  name: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  current?: boolean;
  children?: NavItem[];
}

interface SideNavigationProps {
  items: NavItem[];
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideNavigation = ({ items, setSidebarOpen }: SideNavigationProps) => {
  const { linePath } = useDelimitatedRoute();

  return (
    <nav className="flex-1" aria-label="Sidebar">
      {items.map((item) =>
        !item.children ? (
          <div key={item.name}>
            <a
              href={item.href}
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
          <Disclosure as="div" key={item.name} className="space-y-1" defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button
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
                </Disclosure.Button>
                {item.children && (
                  <Disclosure.Panel className="space-y-1">
                    {item.children.map((subItem) => (
                      <ActiveLink
                        key={subItem.key}
                        href={subItem.href}
                        activeClassName={`${lineSelectionConfig[subItem.key]} ${
                          buttonConfig[subItem.key]
                        } text-white`}
                        lambda={() => subItem.name.toLowerCase() === linePath}
                      >
                        <Disclosure.Button
                          onClick={() => {
                            if (setSidebarOpen) {
                              setSidebarOpen(false);
                            }
                          }}
                          key={subItem.name}
                          as="a"
                          className={() =>
                            classNames(
                              `group flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm font-medium ${
                                linePath !== item.name && 'hover:bg-gray-800'
                              }  cursor-pointer hover:text-white `
                            )
                          }
                        >
                          {subItem.name}
                        </Disclosure.Button>
                      </ActiveLink>
                    ))}
                  </Disclosure.Panel>
                )}
              </>
            )}
          </Disclosure>
        )
      )}
    </nav>
  );
};

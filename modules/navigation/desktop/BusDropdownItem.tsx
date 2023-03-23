import { Listbox } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import type { NavItem } from './SideNavigation';

interface BusDropdownItemProps {
  item: NavItem;
}

export const BusDropdownItem: React.FC<BusDropdownItemProps> = ({ item }) => {
  return (
    <Listbox.Options className="grid grid-cols-3 gap-x-2 gap-y-2 p-1">
      {item.children &&
        item.children.map((subItem) => (
          <Listbox.Option key={subItem.name} as={Fragment} value={subItem.key}>
            {({ active, selected }) => (
              <span
                className={classNames(
                  'flex w-full cursor-pointer items-center justify-center rounded-md border border-mbta-bus bg-mbta-bus p-2 text-sm font-medium',
                  selected && 'bg-opacity-90 text-white',
                  !active && !selected && 'border-opacity-0 bg-opacity-50',
                  active && !selected && 'border-opacity-100 bg-opacity-70 text-white'
                )}
              >
                <p title={subItem.name} className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {subItem.name}
                </p>
              </span>
            )}
          </Listbox.Option>
        ))}
    </Listbox.Options>
  );
};

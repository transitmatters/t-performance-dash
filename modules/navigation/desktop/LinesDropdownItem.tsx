import { Listbox } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { buttonConfig, lineSelectionConfig } from '../styles/lineSelector';
import type { NavItem } from './SideNavigation';

interface LinesDropdownItemProps {
  item: NavItem;
}

export const LinesDropdownItem: React.FC<LinesDropdownItemProps> = ({ item }) => {
  return (
    <Listbox.Options className="space-y-1 pl-2">
      {item.children &&
        item.children.map((subItem) => (
          <Listbox.Option key={subItem.name} as={Fragment} value={subItem.key}>
            {({ active, selected }) => (
              <span
                className={classNames(
                  'group flex w-full items-center rounded-md py-2 pl-2 pr-2 text-sm font-medium',
                  selected &&
                    `${lineSelectionConfig[subItem.key]} ${buttonConfig[subItem.key]} text-white`,
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
  );
};

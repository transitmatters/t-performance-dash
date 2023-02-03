'use client';
import React from 'react';
import { Listbox } from '@headlessui/react';
import classNames from 'classnames';
import Link from 'next/link';
import { LINE_OBJECTS } from '../../constants/lines';
import { MobileMenuButton } from '../general/MobileMenuButton';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../utils/router';
import { NavBarItem } from '../../constants/NavBarLinks';
import { lightColors, lineSelectionConfig } from './LineSelectorStyle';

interface LineSelectorSideBarProps {
  value: NavBarItem;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LineSelectorSideBar: React.FC<LineSelectorSideBarProps> = ({ value, setOpen }) => {
  const route = useDelimitatedRoute();
  if (!route.line) {
    return <div></div>;
  }
  return (
    <Listbox value={LINE_OBJECTS[route.line]} onChange={() => null}>
      <Listbox.Button>
        <MobileMenuButton value={value} />
      </Listbox.Button>
      <Listbox.Options>
        {Object.entries(LINE_OBJECTS).map(([, metadata]) => {
          const href = getLineSelectionItemHref(metadata, route);
          return (
            <Link key={metadata.key} href={href} onClick={() => setOpen(false)}>
              <Listbox.Option
                className={({ active, selected }) =>
                  classNames(
                    active || selected
                      ? `${lineSelectionConfig[metadata.key]} border-l-4 bg-opacity-20`
                      : `${lightColors[metadata.key]} border-l-2 bg-opacity-0 text-gray-900`,
                    'relative ml-2 select-none py-2 pl-3'
                  )
                }
                value={metadata}
              >
                {({ selected }) => (
                  <div
                    className={classNames(
                      selected ? 'font-bold' : 'font-normal',
                      'truncate text-sm text-white'
                    )}
                  >
                    {metadata.name}
                  </div>
                )}
              </Listbox.Option>
            </Link>
          );
        })}
      </Listbox.Options>
    </Listbox>
  );
};

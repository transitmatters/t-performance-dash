import React from 'react';
import classNames from 'classnames';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import { lineColorBackground, lineColorDarkBackground } from '../../common/styles/general';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../common/utils/router';
import type { LineMetadata } from '../../common/types/lines';

interface LineSelectionProps {
  lineItems: LineMetadata[];
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LineSelection: React.FC<LineSelectionProps> = ({ lineItems, setSidebarOpen }) => {
  const route = useDelimitatedRoute();
  const onChange = () => {
    setSidebarOpen && setSidebarOpen(false);
  };

  return (
    <Tab.Group
      vertical
      manual
      selectedIndex={lineItems.findIndex((lineItem) => lineItem.key === route.line)}
      onChange={onChange}
    >
      <Tab.List className="flex flex-col gap-y-1">
        {lineItems.map((lineItem) => {
          return (
            <Tab key={lineItem.key}>
              {({ selected }) => (
                <Link
                  href={getLineSelectionItemHref(lineItem.key, route)}
                  onClick={onChange}
                  key={lineItem.key}
                  className={classNames(
                    'space-between flex w-full cursor-pointer select-none items-center rounded-md bg-opacity-0 py-1 pl-2 text-stone-200  hover:bg-opacity-80',
                    lineColorBackground[lineItem.key ?? 'DEFAULT'],
                    selected && 'bg-opacity-100 text-white text-opacity-95'
                  )}
                >
                  <div
                    className={classNames(
                      'mr-2 h-4 w-4 rounded-full ',
                      lineColorDarkBackground[lineItem.key ?? 'DEFAULT']
                    )}
                  ></div>
                  <p
                    className={classNames(
                      'text-sm font-semibold',
                      selected ? 'text-stone-200' : 'text-white text-opacity-95'
                    )}
                  >
                    {lineItem.name}
                  </p>
                </Link>
              )}
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};

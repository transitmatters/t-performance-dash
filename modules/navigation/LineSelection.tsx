import { useRouter } from 'next/router';
import React from 'react';
import classNames from 'classnames';
import { Tab } from '@headlessui/react';
import { lineColorBackground, lineColorDarkBackground } from '../../common/styles/general';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../common/utils/router';
import type { Line, LineMetadata } from '../../common/types/lines';

interface LineSelectionProps {
  lineItems: LineMetadata[];
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LineSelection: React.FC<LineSelectionProps> = ({ lineItems, setSidebarOpen }) => {
  const router = useRouter();
  const route = useDelimitatedRoute();
  const onChange = (key: Line) => {
    router.push(getLineSelectionItemHref(key, route));
    setSidebarOpen && setSidebarOpen(false);
  };

  return (
    <Tab.Group
      vertical
      manual
      selectedIndex={lineItems.findIndex((lineItem) => lineItem.key === route.line)}
      onChange={(index) => onChange(lineItems[index].key)}
    >
      <Tab.List className=" mx-1 flex flex-col gap-y-1">
        {lineItems.map((lineItem) => {
          return (
            <Tab key={lineItem.key}>
              {({ selected }) => (
                <div
                  onClick={() => onChange(lineItem.key)}
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
                </div>
              )}
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};

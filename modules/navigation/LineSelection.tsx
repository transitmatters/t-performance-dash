import React from 'react';
import classNames from 'classnames';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrainSubway, faTrainTram } from '@fortawesome/free-solid-svg-icons';
import { lineColorBackground, lineColorBorder } from '../../common/styles/general';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../common/utils/router';
import { HEAVY_RAIL_LINES, type LineMetadata } from '../../common/types/lines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';

interface LineSelectionProps {
  lineItems: LineMetadata[];
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LineSelection: React.FC<LineSelectionProps> = ({ lineItems, setSidebarOpen }) => {
  const route = useDelimitatedRoute();
  const onChange = () => {
    setSidebarOpen && setSidebarOpen(false);
  };
  const isMobile = !useBreakpoint('md');

  return (
    <Tab.Group
      manual
      selectedIndex={lineItems.findIndex((lineItem) => lineItem.key === route.line)}
      onChange={onChange}
    >
      <Tab.List
        className={classNames(
          'w-full justify-around gap-2',
          isMobile ? 'flex flex-row' : 'grid grid-cols-2'
        )}
      >
        {lineItems.map((lineItem) => {
          return (
            <Tab key={lineItem.key} aria-label={lineItem.name} className={'w-full'}>
              {({ selected }) => (
                <Link
                  href={getLineSelectionItemHref(lineItem.key, route)}
                  aria-label={lineItem.name}
                  onClick={onChange}
                  key={lineItem.key}
                  className={classNames(
                    'flex cursor-pointer select-none items-center  gap-y-1 rounded-md border-2 bg-opacity-0 py-1 text-stone-200 hover:bg-opacity-80',
                    isMobile ? 'flex-col justify-center' : 'flex-row justify-start gap-2 pl-2',
                    lineColorBorder[lineItem.key],
                    lineColorBackground[lineItem.key ?? 'DEFAULT'],
                    selected ? 'bg-opacity-100' : `bg-opacity-10`
                  )}
                >
                  <FontAwesomeIcon
                    className="h-5 w-5"
                    icon={HEAVY_RAIL_LINES.includes(lineItem.key) ? faTrainSubway : faTrainTram}
                  />
                  <p className={classNames('text-center text-sm text-stone-100')}>
                    {lineItem.short}
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

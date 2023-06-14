import React from 'react';
import classNames from 'classnames';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import { lineColorBackground, lineColorBorder } from '../../common/styles/general';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../common/utils/router';
import { HEAVY_RAIL_LINES, type LineMetadata } from '../../common/types/lines';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrainSubway, faTrainTram } from '@fortawesome/free-solid-svg-icons';
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
      <Tab.List className="flex w-full flex-row justify-around">
        {lineItems.map((lineItem) => {
          return (
            <Tab
              key={lineItem.key}
              aria-label={lineItem.name}
              className={isMobile ? 'w-full px-1' : ''}
            >
              {({ selected }) => (
                <Link
                  href={getLineSelectionItemHref(lineItem.key, route)}
                  aria-label={lineItem.name}
                  onClick={onChange}
                  key={lineItem.key}
                  className={classNames(
                    'flex h-11 w-11 cursor-pointer select-none items-center justify-center rounded-full bg-opacity-0 text-stone-200  hover:bg-opacity-80',
                    lineColorBackground[lineItem.key ?? 'DEFAULT'],
                    selected
                      ? 'bg-opacity-100'
                      : `border-2 bg-opacity-10 ${lineColorBorder[lineItem.key]}`,
                    isMobile ? 'w-full rounded-md' : 'w-11 rounded-full'
                  )}
                >
                  <FontAwesomeIcon
                    className="h-6 w-6"
                    icon={HEAVY_RAIL_LINES.includes(lineItem.key) ? faTrainSubway : faTrainTram}
                  />
                </Link>
              )}
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};

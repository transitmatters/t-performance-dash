import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Tab } from '@headlessui/react';
import { getBusRoutes } from '../../../common/constants/stations';
import { getBusRouteSelectionItemHref, useDelimitatedRoute } from '../../../common/utils/router';

export const BusSelection = () => {
  const route = useDelimitatedRoute();
  const router = useRouter();
  const busRoutes = getBusRoutes();
  return (
    <Tab.Group
      manual
      selectedIndex={busRoutes.findIndex((key) => key === route.query.busRoute)}
      onChange={(index) => {
        router.push(getBusRouteSelectionItemHref(busRoutes[index], route));
      }}
    >
      <Tab.List className="relative grid grid-cols-3 gap-2">
        {busRoutes.map((key) => {
          const selected = route.query.busRoute === key;
          return (
            <Tab key={key}>
              <span
                onClick={() => {
                  router.push(getBusRouteSelectionItemHref(key, route));
                }}
                key={key}
                className={classNames(
                  'flex w-full cursor-pointer items-center justify-center rounded-md border border-mbta-bus bg-mbta-bus p-2 text-sm font-medium',
                  selected
                    ? 'bg-opacity-90 text-white'
                    : 'fovus:bg-opacity-70 border-opacity-0 bg-opacity-50 hover:border-opacity-100 hover:bg-opacity-70 hover:text-white focus:border-opacity-100 focus:text-white'
                )}
              >
                <p title={key} className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {key}
                </p>
              </span>
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};

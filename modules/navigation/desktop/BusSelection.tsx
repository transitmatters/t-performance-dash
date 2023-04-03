import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { getBusRoutes } from '../../../common/constants/stations';
import { lineColorBackground, lineColorDarkBorder } from '../../../common/styles/general';
import { getBusRouteSelectionItemHref, useDelimitatedRoute } from '../../../common/utils/router';

export const BusSelection = () => {
  const route = useDelimitatedRoute();

  const router = useRouter();
  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              'flex w-full justify-center rounded-md border border-opacity-30 bg-opacity-10  py-1 text-white hover:bg-opacity-80',
              lineColorBackground['BUS'],
              lineColorDarkBorder['BUS'],
              route.line === 'BUS' && 'bg-opacity-100'
            )}
          >
            <p>Route{route.query.busRoute ? ` #${route.query.busRoute}` : ''}</p>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-0 z-20 mt-3 w-full transform rounded-md bg-design-rb-900 p-2">
              <div className="relative grid grid-cols-3 gap-2 ">
                {getBusRoutes().map((key) => {
                  const selected = route.query.busRoute === key;
                  return (
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
                  );
                })}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

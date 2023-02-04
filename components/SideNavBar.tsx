import React from 'react';
import { useRouter } from 'next/router';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import { DataPage, DATA_PAGES, DATA_PAGE_NAMES } from '../constants/datapages';
import { LINE_OBJECTS } from '../constants/lines';
import { useDelimitatedRoute } from './utils/router';

export const SideNavBar = () => {
  const router = useRouter();
  const { line, datapage } = useDelimitatedRoute();
  const selectedPage = DATA_PAGES.indexOf(datapage);

  const selectPage = (index: number) => {
    router.push(
      `/${LINE_OBJECTS[line]?.path}${
        DATA_PAGES[index] !== 'overview' ? `/${DATA_PAGES[index]}` : ''
      }`
    );
  };

  return (
    <div className="fixed h-full w-64 bg-design-sideBar px-2 py-4">
      <div className="flex flex-col text-design-sideBarHeader">
        <p className="select-none pb-2 text-lg font-bold">{LINE_OBJECTS[line]?.name}</p>
        <hr />
        <Tab.Group vertical selectedIndex={selectedPage} onChange={selectPage}>
          <Tab.List className="flex flex-col ">
            {DATA_PAGES.map((dataPage: DataPage, index: number) => (
              <Tab className="outline-none" key={dataPage}>
                {({ selected }) => (
                  <div
                    className={classNames(
                      'rounded-md py-2 pl-2 text-start font-medium ring-0',
                      selected
                        ? 'bg-design-rb-900 text-white'
                        : 'font-base text-design-sideBarText hover:bg-design-rb-800 hover:text-white',
                      index === 0 ? 'mt-0' : 'mt-1'
                    )}
                  >
                    {DATA_PAGE_NAMES[dataPage]}
                  </div>
                )}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>
    </div>
  );
};

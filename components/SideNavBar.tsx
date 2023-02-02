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
    <div className="fixed h-full w-40 bg-design-sideBar px-4 py-4">
      <div className="flex flex-col text-design-sideBarHeader">
        <p className="select-none font-bold">Data</p>
        <Tab.Group vertical selectedIndex={selectedPage} onChange={selectPage}>
          <Tab.List className="flex flex-col pl-2">
            {DATA_PAGES.map((dataPage: DataPage, index: number) => (
              <Tab className="outline-none focus:underline" key={dataPage}>
                {({ selected }) => (
                  <div
                    className={classNames(
                      'py-1 pl-2',
                      'ring-0',
                      selected
                        ? 'border-l-2 font-semibold text-white'
                        : 'font-base border-l text-design-sideBarText hover:border-l-2 hover:font-semibold hover:text-white',
                      index === 0 && 'pt-0',
                      index === DATA_PAGES.length - 1 && 'pb-0'
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

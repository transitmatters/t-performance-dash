import Link from 'next/link';
import React from 'react';
import { DATA_PAGES, DATA_PAGE_NAMES } from '../../constants/datapages';
import { LINE_OBJECTS } from '../../constants/lines';
import { useDelimitatedRoute } from '../utils/router';
import { classNames } from '../utils/tailwind';

const DataPageSelectionItem = ({ dataPage, href, isSelected }) => {
  return (
    <Link href={href}>
      <div className={classNames('cursor-pointer select-none items-center justify-center')}>
        <p
          className={classNames(
            'select-none truncate whitespace-nowrap text-center text-sm',
            isSelected ? 'font-bold' : 'font-normal'
          )}
        >
          {DATA_PAGE_NAMES[dataPage]}
        </p>
      </div>
    </Link>
  );
};

export const DataPageSelection = () => {
  const page = useDelimitatedRoute();
  const selectedDataPage = page.datapage || DATA_PAGES[0];
  return (
    <div className="flex h-8 items-center gap-x-4 overflow-scroll rounded-md border-black">
      {DATA_PAGES.map((dataPageItem: string) => {
        let href = `/${LINE_OBJECTS[page.line]?.path}`;
        if (dataPageItem !== DATA_PAGES[0]) {
          href += `/${dataPageItem}`;
        }
        return (
          <DataPageSelectionItem
            isSelected={selectedDataPage === dataPageItem}
            key={dataPageItem}
            dataPage={dataPageItem}
            href={href}
          />
        );
      })}
    </div>
  );
};

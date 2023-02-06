import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { DATA_PAGES } from '../../../common/constants/datapages';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { useDelimitatedRoute } from '../../../common/utils/router';

interface DataPageSelectionItemProps {
  isSelected: boolean;
  href: string;
  name: string;
}

const DataPageSelectionItem: React.FC<DataPageSelectionItemProps> = ({
  name,
  href,
  isSelected,
}) => {
  return (
    <Link href={href}>
      <div className={classNames('cursor-pointer select-none items-center justify-center')}>
        <p
          className={classNames(
            'select-none truncate whitespace-nowrap text-center text-sm',
            isSelected ? 'font-bold' : 'font-normal'
          )}
        >
          {name}
        </p>
      </div>
    </Link>
  );
};

export const DataPageSelection: React.FC = () => {
  const page = useDelimitatedRoute();
  const selectedDataPage = page.datapage || DATA_PAGES[0];
  return (
    <div className="flex h-8 items-center gap-x-4 overflow-auto rounded-md border-black">
      {Object.entries(DATA_PAGES).map(([key, dataPageItem]) => {
        let href = `/${LINE_OBJECTS[page.line]?.path}`;
        if (key !== 'overview') {
          href += `/${key}`;
        }
        return (
          <DataPageSelectionItem
            isSelected={selectedDataPage === dataPageItem.name}
            key={dataPageItem.name}
            name={dataPageItem.name}
            href={href}
          />
        );
      })}
    </div>
  );
};
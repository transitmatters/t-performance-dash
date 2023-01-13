import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { LINE_OBJECTS } from '../../constants/lines';
import { DATA_PAGE_NAMES } from '../../constants/datapages';
import { getPage } from '../utils/router';
import { classNames } from '../utils/tailwind';

type DataPageHeaderProps = {
  dateString: string;
  children?: ReactNode;
};
const headerStyle = {
  RL: 'text-mbta-red',
  OL: 'text-mbta-orange',
  GL: 'text-mbta-green',
  BL: 'text-mbta-blue',
  BUS: 'text-mbta-bus',
};

export const DataPageHeader: React.FC<DataPageHeaderProps> = ({ dateString, children }) => {
  const router = useRouter();
  const page = getPage(router.asPath);

  // Determine the header.
  const getHeader = () => {
    if (page.datapage) {
      return DATA_PAGE_NAMES[page.datapage];
    } else if (page.line) {
      return LINE_OBJECTS[page.line]?.name;
    }
    return '';
  };

  return (
    <div className={classNames('sticky top-11 z-10 mx-1 mb-px w-full justify-center sm:top-16')}>
      <div className="mx-3">
        <div
          className={classNames(
            'flex flex-col items-center justify-center gap-y-1 rounded-b-lg bg-white py-1 shadow-dataBox'
          )}
        >
          <div>
            <h1
              style={{ marginBottom: '-6px' }}
              className={classNames(
                'select-none text-center text-3xl font-bold',
                headerStyle[page.line]
              )}
            >
              {getHeader()}
            </h1>
            <h2
              className={classNames(
                'select-none text-center text-base italic text-design-subtitleGrey'
              )}
            >{`${LINE_OBJECTS[page.line]?.name} - ${dateString}`}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

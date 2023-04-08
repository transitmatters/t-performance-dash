import React from 'react';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { lineColorText } from '../../common/styles/general';
import { RangeTabs } from '../navigation/RangeTabs';

export const DataPageHeader = () => {
  const { line, page } = useDelimitatedRoute();

  return (
    <div className="relative border-b border-gray-200 sm:pb-0">
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="select-none text-3xl font-medium leading-8 text-stone-900 md:text-2xl">
          <span className={lineColorText[line ?? 'DEFAULT']}>
            {line && LINE_OBJECTS[line]?.name}
          </span>
          <span className="text-2xl font-normal md:text-xl">
            {' '}
            - {ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}
          </span>
        </h3>
      </div>
      {ALL_PAGES[page].section === 'trips' && <RangeTabs />}
    </div>
  );
};

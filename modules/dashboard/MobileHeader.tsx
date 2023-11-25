import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { lineColorBackground } from '../../common/styles/general';

export const MobileHeader: React.FC = () => {
  const {
    line,
    page,
    tab,
    query: { busRoute },
  } = useDelimitatedRoute();

  const getLineName = () => {
    if (busRoute) return `Route ${busRoute}`;
    if (line) return LINE_OBJECTS[line]?.name;
    if (tab === 'System') return 'System';
  };
  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mb-2 flex flex-row justify-between gap-x-6 rounded-b-sm text-white text-opacity-95 shadow-md',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className={'flex shrink-0 flex-col pt-2'}>
        <div className="flex shrink-0 flex-row items-baseline pl-2">
          <h3 className="text-lg">{getLineName()}</h3>
          <span className="px-1 text-lg">•</span>
          <h2 className="select-none text-lg">
            <span>{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
          </h2>
        </div>
      </div>
    </div>
  );
};

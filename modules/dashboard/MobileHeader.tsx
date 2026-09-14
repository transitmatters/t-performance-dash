import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { lineColorBackground } from '../../common/styles/general';
import { LINE_COLORS } from '../../common/constants/colors';
import { readableOn } from '../../common/utils/general';

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
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mb-2 flex flex-row justify-between gap-x-6 rounded-b-sm shadow-md',
        needsDarkText ? 'text-stone-900' : 'text-white/95',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className={'flex shrink-0 flex-col pt-2'}>
        <h1 className="flex shrink-0 flex-row items-baseline pl-2 text-lg">
          <span>{getLineName()}</span>
          <span className="px-1" aria-hidden>
            •
          </span>
          <span className="select-none">{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
        </h1>
      </div>
    </div>
  );
};

import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { lineColorBackground } from '../../common/styles/general';
import { RangeTabs } from '../navigation/RangeTabs';
import { OverviewRangeTypes } from '../../common/constants/dates';

export const MobileHeader: React.FC = () => {
  const {
    line,
    page,
    query: { busRoute, startDate, endDate, view },
  } = useDelimitatedRoute();
  const section = page ? ALL_PAGES[page]?.section : undefined;

  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mx-3 mb-2 flex flex-row justify-between gap-x-6 rounded-b-md text-white text-opacity-95 shadow-md',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div
        className={classNames(
          'flex shrink-0 flex-col pt-2',
          section === 'trips' ? 'justify-between' : 'justify-center'
        )}
      >
        <div className="flex shrink-0 flex-row items-baseline pl-2">
          <h3 className="text-lg font-semibold">
            {busRoute ? `Route ${busRoute}` : line && LINE_OBJECTS[line]?.short}
          </h3>
          {ALL_PAGES[page]?.sectionTitle && (
            <>
              <span className="px-1 text-lg">•</span>
              <h2 className="select-none text-lg font-semibold">
                <span>{ALL_PAGES[page]?.sectionTitle}</span>
              </h2>
            </>
          )}
          <span className="px-1 text-lg">•</span>
          <h2 className="select-none text-lg font-semibold">
            <span>{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
          </h2>
        </div>
        {ALL_PAGES[page]?.section === 'trips' && <RangeTabs />}
      </div>
      <div className="absolute bottom-0 right-0 flex items-baseline pb-1 pr-2 text-stone-200">
        <p className=" text-xs italic">
          {view ? OverviewRangeTypes[view] : dayjs(startDate).format(`M/D/YY`)}
          {endDate && ` - ${dayjs(endDate).format(`M/D/YY`)}`}
        </p>
      </div>
    </div>
  );
};

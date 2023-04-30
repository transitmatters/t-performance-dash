import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ControlPanel } from '../../common/components/controls/ControlPanel';
import { lineColorDarkBorder, lineColorText } from '../../common/styles/general';
import { RangeTabs } from '../navigation/RangeTabs';

export const DataPageHeader = () => {
  const {
    line,
    page,
    query: { queryType, busRoute },
  } = useDelimitatedRoute();
  const section = page ? ALL_PAGES[page]?.section : undefined;
  const md = useBreakpoint('md');
  const lg = useBreakpoint('lg');
  const isMobile = !md;
  const shortTitle = md && !lg;
  const showControlParams = section && line && section !== 'today';

  return (
    <div
      className={classNames(
        'sticky top-0 z-30 mb-4 mt-0 flex flex-row justify-between gap-x-4 rounded-b-md border border-t-0 border-gray-200 bg-white p-3 shadow-lg sm:pb-3 md:mx-4',
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
    >
      <div className="flex flex-shrink-0 flex-col">
        <div className={classNames('flex flex-shrink-0 flex-row items-baseline md:pb-2')}>
          <h3 className={classNames(lineColorText[line ?? 'DEFAULT'], 'text-2xl font-semibold')}>
            {!shortTitle ? line && LINE_OBJECTS[line]?.name : line && LINE_OBJECTS[line]?.key}
          </h3>
          {ALL_PAGES[page]?.sectionTitle && (
            <>
              <span className="px-1 text-xl">•</span>
              <h2 className="select-none pl-1 text-xl font-semibold">
                <span>{ALL_PAGES[page]?.sectionTitle}</span>
              </h2>
            </>
          )}
          <span className="px-1 text-xl">•</span>
          <h2 className="select-none pl-1 text-xl font-semibold">
            <span>{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
          </h2>
        </div>
        {ALL_PAGES[page]?.section === 'trips' && <RangeTabs />}
      </div>
      {!isMobile && showControlParams && (
        <ControlPanel section={section} line={line} queryType={queryType} busRoute={busRoute} />
      )}
    </div>
  );
};

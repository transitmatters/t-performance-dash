import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ControlPanel } from '../../common/components/controls/ControlPanel';
import { lineColorDarkBorder, lineColorText } from '../../common/styles/general';

export const DataPageHeader = () => {
  const {
    line,
    page,
    query: { queryType, busRoute },
  } = useDelimitatedRoute();
  const section = page ? ALL_PAGES[page]?.section : undefined;
  const isMobile = !useBreakpoint('md');
  const showControlParams = section && line && section !== 'today';

  return (
    <div
      className={classNames(
        'sticky top-0 z-30 mb-4 mt-0 flex flex-col justify-between gap-x-4 rounded-b-md border border-t-0 border-gray-200 bg-white p-3 shadow-lg sm:pb-3 md:mx-4',
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
    >
      <div className={classNames('flex shrink-0 flex-row items-baseline md:pb-2')}>
        <h3 className={classNames(lineColorText[line ?? 'DEFAULT'], 'text-2xl font-semibold')}>
          {line && LINE_OBJECTS[line]?.name}
        </h3>
        {ALL_PAGES[page]?.sectionTitle && (
          <>
            <span className="px-2 text-xl">•</span>
            <h2 className="select-none pl-1 text-xl font-semibold">
              <span>{ALL_PAGES[page]?.sectionTitle}</span>
            </h2>
          </>
        )}
        <span className="px-2 text-xl">•</span>
        <h2 className="select-none pl-1 text-xl font-semibold">
          <span>{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
        </h2>
        {ALL_PAGES[page]?.section === 'trips' && <RangeTabs />}
      </div>
      {!isMobile && showControlParams && (
        <ControlPanel section={section} line={line} queryType={queryType} busRoute={busRoute} />
      )}
    </div>
  );
};

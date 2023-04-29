import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { RangeTabs } from '../navigation/RangeTabs';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ControlPanel } from '../../common/components/controls/ControlPanel';
import { lineColorBorder, lineColorText } from '../../common/styles/general';

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
        'sticky top-0 z-30 border-b border-gray-200 bg-stone-200 sm:pb-0',
        lineColorBorder[line ?? 'DEFAULT']
      )}
    >
      <div className="flex w-full flex-col p-2">
        <h3 className="select-none text-3xl font-medium leading-8 text-stone-900 md:text-2xl">
          <span className={lineColorText[line ?? 'DEFAULT']}>
            {line && LINE_OBJECTS[line]?.name}
          </span>
          <span className="text-2xl font-normal md:text-xl">
            {' - '}
            {ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}
          </span>
        </h3>
        {!isMobile && showControlParams && (
          <ControlPanel section={section} line={line} queryType={queryType} busRoute={busRoute} />
        )}
        {ALL_PAGES[page]?.section === 'trips' && <RangeTabs />}
      </div>
    </div>
  );
};

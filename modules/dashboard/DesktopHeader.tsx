import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ControlPanel } from '../../common/components/controls/ControlPanel';
import { lineColorBackground } from '../../common/styles/general';
import { RangeTabs } from '../navigation/RangeTabs';

export const DesktopHeader: React.FC = () => {
  const {
    line,
    page,
    query: { queryType, busRoute },
  } = useDelimitatedRoute();
  const section = page ? ALL_PAGES[page]?.section : undefined;
  const lg = useBreakpoint('lg');

  const showControls = section && line && section !== 'today';

  const getLineName = () => {
    if (busRoute) return `Route ${busRoute}`;
    if (line && !lg) return LINE_OBJECTS[line]?.short;
    if (line) return LINE_OBJECTS[line]?.name;
  };
  return (
    <div
      className={classNames(
        'sticky top-0 z-30 mx-3 mb-2 flex flex-row justify-between gap-x-6 rounded-bl-none rounded-br-md  border-gray-200 text-white shadow-md md:mx-0 md:mr-4 md:border-l-0',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div
        className={classNames(
          'flex shrink-0 flex-col pt-2',
          section === 'trips' ? 'justify-end gap-y-3' : 'h-14 justify-center'
        )}
      >
        <div className="flex shrink-0 flex-row items-baseline pl-3">
          <h3 className="text-xl font-semibold">{getLineName()}</h3>
          {ALL_PAGES[page]?.sectionTitle && (
            <>
              <span className="px-1 text-xl">•</span>
              <h2 className="select-none text-xl font-semibold">
                <span>{ALL_PAGES[page]?.sectionTitle}</span>
              </h2>
            </>
          )}
          <span className="px-1 text-xl">•</span>
          <h2 className="select-none text-xl font-semibold">
            <span>{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
          </h2>
        </div>
        {ALL_PAGES[page]?.section === 'trips' && <RangeTabs />}
      </div>
      {showControls && (
        <ControlPanel section={section} line={line} queryType={queryType} busRoute={busRoute} />
      )}
    </div>
  );
};

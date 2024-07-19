import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { ControlPanel } from '../../common/components/controls/ControlPanel';
import { lineColorBackground } from '../../common/styles/general';

export const DesktopHeader: React.FC = () => {
  const {
    line,
    page,
    query: { busRoute },
    tab,
  } = useDelimitatedRoute();
  const dateStoreSection = page ? ALL_PAGES[page]?.dateStoreSection : undefined;

  const showControls =
    dateStoreSection && (line || tab === 'System') && dateStoreSection !== 'today';

  const getLineName = () => {
    if (busRoute) return `Route ${busRoute}`;
    if (line) return LINE_OBJECTS[line]?.name;
    if (tab === 'System') return 'System';
  };
  return (
    <div
      className={classNames(
        'sticky top-0 z-10 mx-3 mb-2 flex flex-row justify-between gap-x-6 rounded-bl-none rounded-br-md border-gray-200 text-white shadow-md md:mx-0 md:mr-4 md:border-l-0',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className={classNames('flex h-14 shrink-0 flex-col justify-center pt-2')}>
        <div className="flex shrink-0 flex-row items-baseline pl-3">
          <h3 className="text-xl">{getLineName()}</h3>
          <span className="px-1 text-xl">•</span>
          <h2 className="select-none text-xl">
            <span>{ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}</span>
          </h2>
        </div>
      </div>
      {showControls && (
        <ControlPanel dateStoreSection={dateStoreSection} line={line} busRoute={busRoute} />
      )}
    </div>
  );
};

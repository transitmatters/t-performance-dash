import React from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { PrimaryControls, StationControls } from '../../common/components/controls/ControlPanel';
import { lineColorBackground } from '../../common/styles/general';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../../common/types/lines';
import { LINE_COLORS } from '../../common/constants/colors';
import { readableOn } from '../../common/utils/general';
import { RouteBullet } from '../../common/components/transit/RouteBullet';

export const DesktopHeader: React.FC = () => {
  const {
    line,
    page,
    query: { busRoute, crRoute, ferryRoute },
    tab,
  } = useDelimitatedRoute();
  const dateStoreSection = page ? ALL_PAGES[page]?.dateStoreSection : undefined;

  const showControls =
    dateStoreSection && (line || tab === 'System') && dateStoreSection !== 'today';

  const getLineName = () => {
    if (busRoute) return `Route ${busRoute}`;
    if (crRoute) return COMMUTER_RAIL_LINE_NAMES[crRoute];
    if (ferryRoute) return FERRY_LINE_NAMES[ferryRoute];
    if (line) return LINE_OBJECTS[line]?.name;
    if (tab === 'System') return 'System';
  };

  // Bus yellow and the other light line colors can't carry white text.
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';
  const controlProps = {
    dateStoreSection: dateStoreSection!,
    line,
    busRoute,
    crRoute,
    ferryRoute,
  };

  return (
    <div
      className={classNames(
        'sticky top-0 z-10 mb-2 flex flex-col gap-y-3 px-5 py-3 shadow-md',
        needsDarkText ? 'text-stone-900' : 'text-white',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className="flex flex-row flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <h1 className="flex shrink-0 flex-row items-baseline gap-x-2 text-xl">
          <span className="font-bold">{getLineName()}</span>
          <RouteBullet
            size="sm"
            className={classNames(
              'self-center',
              needsDarkText ? 'text-stone-900/60' : 'text-white/70'
            )}
          />
          <span className="font-normal select-none">
            {ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name}
          </span>
        </h1>
        {showControls && <PrimaryControls {...controlProps} />}
      </div>
      {showControls && <StationControls {...controlProps} />}
    </div>
  );
};

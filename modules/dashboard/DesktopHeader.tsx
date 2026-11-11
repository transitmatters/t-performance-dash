import classNames from 'classnames';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ALL_PAGES } from '../../common/constants/pages';
import { BandControls, BarControls } from '../../common/components/controls/ControlPanel';
import { lineColorBackground } from '../../common/styles/general';
import { LINE_COLORS } from '../../common/constants/colors';
import { readableOn } from '../../common/utils/general';
import { RouteBullet } from '../../common/components/transit/RouteBullet';
import { usePageHeading } from '../../common/hooks/usePageHeading';

export const DesktopHeader = () => {
  const {
    line,
    page,
    query: { busRoute, crRoute, ferryRoute },
    tab,
  } = useDelimitatedRoute();
  const { lineName, pageTitle } = usePageHeading();
  const dateStoreSection = page ? ALL_PAGES[page]?.dateStoreSection : undefined;

  const showControls =
    dateStoreSection && (line || tab === 'System') && dateStoreSection !== 'today';

  // Bus yellow and the other light line colors can't carry white text.
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';
  const controlProps = {
    dateStoreSection: dateStoreSection!,
    line,
    busRoute,
    crRoute,
    ferryRoute,
    hasStationStore: ALL_PAGES[page]?.hasStationStore,
    hasRouteSelector: ALL_PAGES[page]?.hasRouteSelector,
  };

  return (
    <div className="sticky top-0 z-10 mb-2 shadow-md">
      <div
        className={classNames(
          'flex flex-row flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3',
          needsDarkText ? 'text-stone-900' : 'text-white',
          lineColorBackground[line ?? 'DEFAULT']
        )}
      >
        <h1 className="flex shrink-0 flex-row items-baseline gap-x-2 text-xl">
          <span className="font-bold">{lineName}</span>
          <RouteBullet
            size="sm"
            className={classNames(
              'self-center',
              needsDarkText ? 'text-stone-900/60' : 'text-white/70'
            )}
          />
          <span className="font-normal select-none">{pageTitle}</span>
        </h1>
        {showControls && <BandControls {...controlProps} />}
      </div>
      {showControls && <BarControls {...controlProps} />}
    </div>
  );
};

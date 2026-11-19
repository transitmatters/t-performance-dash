import classNames from 'classnames';
import { BandControls, BarControls } from '../../common/components/controls/ControlPanel';
import { RouteBullet } from '../../common/components/transit/RouteBullet';
import { usePageControls } from '../../common/hooks/usePageControls';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { lineColorBackground, needsDarkTextOn, textOnLineColor } from '../../common/styles/general';
import { RouteSelector } from '../../common/components/controls/RouteSelector';
import { LineSwitcher } from '../navigation/LineSwitcher';

export const DesktopHeader = () => {
  const { lineName, routeName, pageTitle } = usePageHeading();
  const { visible: showControls, colorKey, line, showRouteSelector } = usePageControls();

  return (
    <div className="sticky top-0 z-10 mb-2 shadow-md">
      <div
        className={classNames(
          'flex flex-row flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3',
          textOnLineColor(colorKey),
          lineColorBackground[colorKey ?? 'DEFAULT']
        )}
      >
        <h1 className="flex shrink-0 flex-row items-center gap-x-2 text-xl">
          {line ? (
            <LineSwitcher className="-ml-1.5 font-bold" />
          ) : (
            <span className="font-bold">{lineName}</span>
          )}
          {showRouteSelector ? (
            <RouteSelector className="font-bold" />
          ) : (
            line && routeName && <span className="font-bold">{routeName}</span>
          )}
          <RouteBullet
            size="sm"
            className={needsDarkTextOn(colorKey) ? 'text-stone-900/60' : 'text-white/70'}
          />
          <span className="font-normal select-none">{pageTitle}</span>
        </h1>
        {showControls && <BandControls />}
      </div>
      {showControls && <BarControls />}
    </div>
  );
};

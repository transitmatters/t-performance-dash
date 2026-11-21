import classNames from 'classnames';
import { BandControls, BarControls } from '../../common/components/controls/ControlPanel';
import { RouteBullet } from '../../common/components/transit/RouteBullet';
import { usePageControls } from '../../common/hooks/usePageControls';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { lineColorBackground, needsDarkTextOn, textOnLineColor } from '../../common/styles/general';
import { HeadingSwitchers } from './HeadingSwitchers';

export const DesktopHeader = () => {
  const { pageTitle } = usePageHeading();
  const { visible: showControls, colorKey, showTripControls } = usePageControls();

  return (
    <div className="sticky top-0 z-10 mb-2 shadow-md">
      <div
        className={classNames(
          'flex flex-row flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3',
          textOnLineColor(colorKey),
          lineColorBackground[colorKey ?? 'DEFAULT']
        )}
      >
        {/* min-w-0 so a long route name truncates instead of overflowing the band. */}
        <h1 className="flex min-w-0 flex-row items-center gap-x-2 text-xl">
          <HeadingSwitchers compact="belowLg" className="font-bold" />
          <RouteBullet
            size="sm"
            className={needsDarkTextOn(colorKey) ? 'text-stone-900/60' : 'text-white/70'}
          />
          <span className="shrink-0 font-normal whitespace-nowrap select-none">{pageTitle}</span>
        </h1>
        {showControls && showTripControls && <BandControls />}
      </div>
      {showControls && <BarControls />}
    </div>
  );
};

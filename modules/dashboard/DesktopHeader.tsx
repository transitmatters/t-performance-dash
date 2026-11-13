import classNames from 'classnames';
import { BandControls, BarControls } from '../../common/components/controls/ControlPanel';
import { RouteBullet } from '../../common/components/transit/RouteBullet';
import { usePageControls } from '../../common/hooks/usePageControls';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { lineColorBackground, needsDarkTextOn, textOnLineColor } from '../../common/styles/general';

export const DesktopHeader = () => {
  const { lineName, pageTitle } = usePageHeading();
  const { visible: showControls, line } = usePageControls();

  return (
    <div className="sticky top-0 z-10 mb-2 shadow-md">
      <div
        className={classNames(
          'flex flex-row flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3',
          textOnLineColor(line),
          lineColorBackground[line ?? 'DEFAULT']
        )}
      >
        <h1 className="flex shrink-0 flex-row items-baseline gap-x-2 text-xl">
          <span className="font-bold">{lineName}</span>
          <RouteBullet
            size="sm"
            className={classNames(
              'self-center',
              needsDarkTextOn(line) ? 'text-stone-900/60' : 'text-white/70'
            )}
          />
          <span className="font-normal select-none">{pageTitle}</span>
        </h1>
        {showControls && <BandControls />}
      </div>
      {showControls && <BarControls />}
    </div>
  );
};

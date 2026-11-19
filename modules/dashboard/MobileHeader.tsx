import classNames from 'classnames';
import { RouteSelector } from '../../common/components/controls/RouteSelector';
import { usePageControls } from '../../common/hooks/usePageControls';
import { lineColorBackground, textOnLineColor } from '../../common/styles/general';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { LineSwitcher } from '../navigation/LineSwitcher';

export const MobileHeader = () => {
  const { colorKey, line, showRouteSelector } = usePageControls();
  const { lineName, routeName, pageTitle } = usePageHeading();

  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mb-2 rounded-b-sm px-3 py-2 shadow-md',
        textOnLineColor(colorKey),
        lineColorBackground[colorKey ?? 'DEFAULT']
      )}
    >
      <h1 className="flex min-w-0 flex-row items-center gap-2 text-base">
        {line ? (
          <LineSwitcher compact={showRouteSelector} className="h-8 shrink-0 font-semibold" />
        ) : (
          <span className="font-semibold">{lineName}</span>
        )}
        {showRouteSelector ? (
          <RouteSelector className="h-8 font-semibold" />
        ) : (
          line && routeName && <span className="font-semibold">{routeName}</span>
        )}
        {/* The route name truncates first; the page title always shows in full. */}
        <span className="shrink-0 whitespace-nowrap select-none">
          <span className="pr-2 opacity-70" aria-hidden>
            •
          </span>
          {pageTitle}
        </span>
      </h1>
    </div>
  );
};

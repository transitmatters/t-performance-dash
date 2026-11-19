import classNames from 'classnames';
import { usePageControls } from '../../common/hooks/usePageControls';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { lineColorBackground, textOnLineColor } from '../../common/styles/general';
import { HeadingSwitchers } from './HeadingSwitchers';

export const MobileHeader = () => {
  const { colorKey } = usePageControls();
  const { pageTitle } = usePageHeading();

  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mb-2 rounded-b-sm px-3 py-2 shadow-md',
        textOnLineColor(colorKey),
        lineColorBackground[colorKey ?? 'DEFAULT']
      )}
    >
      <h1 className="flex min-w-0 flex-row items-center gap-2 text-base">
        <HeadingSwitchers compact className="font-semibold" pillClassName="h-8" />
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

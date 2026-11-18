import classNames from 'classnames';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineColorBackground, textOnLineColor } from '../../common/styles/general';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { LineSwitcher } from '../navigation/LineSwitcher';

export const MobileHeader = () => {
  const { colorKey, line } = useDelimitatedRoute();
  const { lineName, routeName, pageTitle } = usePageHeading();

  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mb-2 flex flex-row justify-between gap-x-6 rounded-b-sm shadow-md',
        textOnLineColor(colorKey),
        lineColorBackground[colorKey ?? 'DEFAULT']
      )}
    >
      <div className={'flex min-w-0 flex-col py-1.5'}>
        <h1 className="flex flex-row flex-wrap items-baseline gap-x-1 pl-2 text-lg">
          {line ? <LineSwitcher className="-ml-0.5 self-center" /> : <span>{lineName}</span>}
          {line && routeName && <span>{routeName}</span>}
          <span className="px-1" aria-hidden>
            •
          </span>
          <span className="select-none">{pageTitle}</span>
        </h1>
      </div>
    </div>
  );
};

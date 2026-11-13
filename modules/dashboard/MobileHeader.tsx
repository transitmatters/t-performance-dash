import classNames from 'classnames';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineColorBackground, textOnLineColor } from '../../common/styles/general';
import { usePageHeading } from '../../common/hooks/usePageHeading';

export const MobileHeader = () => {
  const { line } = useDelimitatedRoute();
  const { lineName, pageTitle } = usePageHeading();

  return (
    <div
      className={classNames(
        'sticky top-12 z-10 mb-2 flex flex-row justify-between gap-x-6 rounded-b-sm shadow-md',
        textOnLineColor(line),
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className={'flex shrink-0 flex-col pt-2'}>
        <h1 className="flex shrink-0 flex-row items-baseline pl-2 text-lg">
          <span>{lineName}</span>
          <span className="px-1" aria-hidden>
            •
          </span>
          <span className="select-none">{pageTitle}</span>
        </h1>
      </div>
    </div>
  );
};

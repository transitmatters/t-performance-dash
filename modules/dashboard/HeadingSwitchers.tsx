import classNames from 'classnames';
import { RouteSelector } from '../../common/components/controls/RouteSelector';
import { usePageControls } from '../../common/hooks/usePageControls';
import { usePageHeading } from '../../common/hooks/usePageHeading';
import { LineSwitcher } from '../navigation/LineSwitcher';

interface HeadingSwitchersProps {
  /** Applied to everything shown, switchers and plain names alike. */
  className?: string;
  /** Applied only to the two switcher buttons. */
  pillClassName?: string;
  /** Show only the line's icon when a route switcher follows it: always, or below `lg`. */
  compact?: boolean | 'belowLg';
}

/** The line and route part of the page heading: switchers where they apply, names otherwise. */
export const HeadingSwitchers = ({ className, pillClassName, compact }: HeadingSwitchersProps) => {
  const { line, showRouteSelector } = usePageControls();
  const { lineName, routeName, allCrLines } = usePageHeading();

  if (!line) return <span className={className}>{lineName}</span>;

  return (
    <>
      <LineSwitcher
        compact={showRouteSelector && !allCrLines ? compact : false}
        className={classNames('shrink-0', className, pillClassName)}
      />
      {allCrLines ? (
        <span className={classNames('shrink-0', className)}>All lines</span>
      ) : showRouteSelector ? (
        <RouteSelector className={classNames(className, pillClassName)} />
      ) : (
        routeName && <span className={className}>{routeName}</span>
      )}
    </>
  );
};

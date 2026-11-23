import { LabeledControl } from '../../../common/components/controls/LabeledControl';
import { getBusRouteDataIds } from '../../../common/constants/lines';
import { ToggleControl } from '../../../common/hooks/useChartToggle';
import { usePageRoute } from '../../../common/utils/router';
import {
  useDayType,
  useDirection,
  useRankings,
  useRouteId,
  useShownPeriod,
  useTimeBand,
} from '../useBusSpeedParams';

/** Weekly and monthly files split weekdays from weekends; a single day is already one or the other. */
const DayTypeFilter = () => {
  const dayType = useDayType();
  return (
    <LabeledControl label="Days">
      <ToggleControl variant="toggle" {...dayType} onChange={dayType.setValue} />
    </LabeledControl>
  );
};

const TimeBandFilter = () => {
  const band = useTimeBand();
  return (
    <LabeledControl label="Time of day">
      <ToggleControl variant="select" {...band} onChange={band.setValue} />
    </LabeledControl>
  );
};

/** Narrows a combined route like SL4/SL5 to one of its routes, drawn over one another otherwise. */
const RouteFilter = ({ routeIds }: { routeIds: string[] }) => {
  const route = useRouteId(routeIds);
  return (
    <LabeledControl label="Showing">
      <ToggleControl variant="toggle" {...route} onChange={route.setValue} />
    </LabeledControl>
  );
};

export const SpeedMapFilters = () => {
  const {
    query: { busRoute },
  } = usePageRoute();
  const { shown } = useShownPeriod();
  const direction = useDirection();
  const routeIds = busRoute ? getBusRouteDataIds(busRoute) : [];
  return (
    <>
      {routeIds.length > 1 && <RouteFilter routeIds={routeIds} />}
      {shown !== 'daily' && <DayTypeFilter />}
      <TimeBandFilter />
      <LabeledControl label="Direction">
        <ToggleControl variant="toggle" {...direction} onChange={direction.setValue} />
      </LabeledControl>
    </>
  );
};

/** The route view sums whole days, so day type and time of day only apply to segments. */
export const RankingsFilters = () => {
  const { viewMode } = useRankings();
  const { shown } = useShownPeriod();
  if (viewMode !== 'segment') return null;
  return (
    <>
      {shown !== 'daily' && <DayTypeFilter />}
      <TimeBandFilter />
    </>
  );
};

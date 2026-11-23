import { useTripPage } from '../../common/hooks/usePageParams';
import { asDateRange } from '../../common/utils/pageParams';
import { TripSlowZonesCallout } from '../slowzones/TripSlowZonesCallout';
import { isSlowZonesLine } from '../slowzones/types';
import { BusTripGraphs } from './BusTripGraphs';
import { SubwayTripGraphs } from './SubwayTripGraphs';
import { CommuterRailTripGraphs } from './CommuterRailTripGraphs';
import { FerryTripGraphs } from './FerryTripGraphs';

export const TripGraphs = () => {
  const { tab } = useTripPage();
  if (tab === 'Bus') return <BusTripGraphs />;
  if (tab === 'Commuter Rail') return <CommuterRailTripGraphs />;
  if (tab === 'Ferry') return <FerryTripGraphs />;
  return <SubwayTripGraphs />;
};

/** How much time slow zones added to a subway trip, for the notices above its charts. */
export const TripSlowZonesBanner = () => {
  const { lineShort, linePath, dates, fromStation, toStation } = useTripPage();
  if (!isSlowZonesLine(lineShort)) return null;
  const { startDate, endDate } = asDateRange(dates);
  return (
    <TripSlowZonesCallout
      fromStation={fromStation}
      toStation={toStation}
      lineShort={lineShort}
      linePath={linePath}
      startDate={startDate}
      endDate={endDate}
      withChartToggle={dates.kind === 'range'}
    />
  );
};

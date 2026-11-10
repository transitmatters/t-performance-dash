'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useReliabilityData } from '../../common/api/hooks/reliability';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { Notice } from '../../common/components/notices/Notice';
import { FREQUENT_BUS_ROUTE_IDS, getBusRouteIds } from '../../common/constants/lines';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { TheRideReliability } from './TheRideReliability';
import { CommuterRailReliability } from './CommuterRailReliability';
import { HeadwayReliability } from './HeadwayReliability';

// "commuter-rail" asks the API for every commuter rail route combined
const ALL_COMMUTER_RAIL = 'commuter-rail';

export function ReliabilityDetails() {
  const {
    line,
    lineShort,
    query: { startDate, endDate, crRoute, busRoute },
  } = useDelimitatedRoute();
  const isRide = line === 'line-RIDE';
  const isBus = line === 'line-bus';
  const isSubway = line !== undefined && !isBus && !isRide && line !== 'line-commuter-rail';
  // Grouped labels (e.g. 114/116/117) are summed server-side across their route_ids
  const busRouteIds = isBus && busRoute ? getBusRouteIds(busRoute) : [];
  const routeId = isRide
    ? 'RIDE'
    : isSubway
      ? line
      : isBus
        ? busRouteIds.join(',')
        : (crRoute ?? ALL_COMMUTER_RAIL);
  const isFrequentBus = busRouteIds.some((id) => FREQUENT_BUS_ROUTE_IDS.includes(id));
  const { agg } = useMemo(
    () => getSpeedGraphConfig(dayjs(startDate), dayjs(endDate)),
    [startDate, endDate]
  );

  const enabled = Boolean(startDate && endDate && line && routeId);
  const reliability = useReliabilityData(
    { route_id: routeId, start_date: startDate, end_date: endDate, agg },
    enabled
  );

  const title =
    isRide || isSubway || isBus
      ? 'Reliability'
      : `Reliability · ${crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : 'All lines'}`;
  const props = { reliability, agg, startDate, endDate };

  return (
    <PageWrapper pageTitle={title}>
      <ChartPageDiv>
        {isBus && busRoute && !isFrequentBus && (
          <Notice title={`Route ${busRoute} isn't a Frequent Bus route`}>
            <p>
              Riders on less frequent routes tend to plan around the timetable rather than turn up
              and wait, so gaps between buses matter less to them than whether each bus is on time,
              which this page doesn&apos;t measure.
            </p>
          </Notice>
        )}
        {isSubway || isBus ? (
          <HeadwayReliability line={line} lineShort={lineShort} {...props} />
        ) : isRide ? (
          <TheRideReliability {...props} />
        ) : (
          <CommuterRailReliability {...props} />
        )}
        <DataNotes>
          {isSubway ? (
            <>
              <p>
                A headway is the time between one train leaving a station and the next. We measure
                every headway at every station except the terminals, from the arrival and departure
                records for each stop, and compare it with the scheduled headway at that time of
                day. Where branches share track, trains from every branch count together, since
                riders there can take any of them.
              </p>
              <p>
                Every headway falls in one of five groups, by how it compared with the scheduled
                headway: bunched (half of it or less), short (50–75%), on time (75–125%), long
                (125–150%), and long gap (150% or more). Each share is every matching headway at
                every station divided by all of them, added up over the period rather than averaged
                from daily percentages. On time is the measure the home page judges each line on.
              </p>
            </>
          ) : isBus ? (
            <>
              <p>
                A headway is the time between one bus and the next on the same route and direction.
                We measure every headway at the route&apos;s timepoints (the stops the schedule sets
                times for) from the MBTA&apos;s LAMP bus data, and compare it with the scheduled
                headway at that time of day. The first and last stops are left out: buses are often
                held at the start of the route to even out gaps, and nobody boards at the end.
              </p>
              <p>
                Only buses on the same route count, so where several routes share a street, a bus on
                another route doesn&apos;t fill the gap. Combined pages such as 114/116/117 add up
                each route&apos;s headways. The groups (bunched to long gap) are the same as on the
                subway. LAMP bus data starts on December 24, 2025.
              </p>
              <BusDataNotice />
            </>
          ) : isRide ? (
            <>
              <p>
                Daily trip counts published by the MBTA on its open data portal. From September 2025
                the MBTA reports requests, no-shows and missed trips alongside completed and on-time
                trips; earlier history (back to July 2014) only has completed and on-time trips. No
                reliability data was published for August 2025.
              </p>
              <p>
                "On time" is the share of completed trips that picked up on time, which can be
                compared across the whole history. The MBTA's own OTP figure also counts rider
                no-shows as on time and missed trips as late, so it's shown separately from January
                2026, when those counts start.
              </p>
            </>
          ) : (
            <p>
              Daily on-time and cancellation counts by line, published by the MBTA on its open data
              portal, split into peak and off-peak service. Branches that share a line, such as Fall
              River and New Bedford or trains running via the Fairmount Line, are counted under
              their line. The data is updated monthly, so the latest weeks may be missing.
            </p>
          )}
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}

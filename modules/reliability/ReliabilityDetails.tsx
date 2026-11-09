'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useReliabilityData } from '../../common/api/hooks/reliability';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { TheRideReliability } from './TheRideReliability';
import { CommuterRailReliability } from './CommuterRailReliability';
import { SubwayReliability } from './SubwayReliability';

// "commuter-rail" asks the API for every commuter rail route combined
const ALL_COMMUTER_RAIL = 'commuter-rail';

export function ReliabilityDetails() {
  const {
    line,
    lineShort,
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();
  const isRide = line === 'line-RIDE';
  const isSubway = line !== undefined && line !== 'line-RIDE' && line !== 'line-commuter-rail';
  const routeId = isRide ? 'RIDE' : isSubway ? line : (crRoute ?? ALL_COMMUTER_RAIL);
  const { agg } = useMemo(
    () => getSpeedGraphConfig(dayjs(startDate), dayjs(endDate)),
    [startDate, endDate]
  );

  const enabled = Boolean(startDate && endDate && line);
  const reliability = useReliabilityData(
    { route_id: routeId, start_date: startDate, end_date: endDate, agg },
    enabled
  );

  const title =
    isRide || isSubway
      ? 'Reliability'
      : `Reliability · ${crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : 'All lines'}`;
  const props = { reliability, agg, startDate, endDate };

  return (
    <PageWrapper pageTitle={title}>
      <ChartPageDiv>
        {isSubway ? (
          <SubwayReliability line={line} lineShort={lineShort} {...props} />
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
                75–125% of the scheduled headway is the band the home page judges each line on;
                50–150% is shown alongside it. Before 2025, the MBTA's monthly archives compare
                Green Line trunk stations with a single branch's schedule, so those weeks show more
                bunching than riders saw.
              </p>
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

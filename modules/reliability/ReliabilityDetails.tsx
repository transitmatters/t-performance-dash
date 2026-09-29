'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useReliabilityData } from '../../common/api/hooks/reliability';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { TheRideReliability } from './TheRideReliability';
import { CommuterRailReliability } from './CommuterRailReliability';

// "commuter-rail" asks the API for every commuter rail route combined
const ALL_COMMUTER_RAIL = 'commuter-rail';

export function ReliabilityDetails() {
  const {
    line,
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();
  const isRide = line === 'line-RIDE';
  const routeId = isRide ? 'RIDE' : (crRoute ?? ALL_COMMUTER_RAIL);
  const { agg } = React.useMemo(
    () => getSpeedGraphConfig(dayjs(startDate), dayjs(endDate)),
    [startDate, endDate]
  );

  const enabled = Boolean(startDate && endDate && line);
  const reliability = useReliabilityData(
    { route_id: routeId, start_date: startDate, end_date: endDate, agg },
    enabled
  );

  const title = isRide
    ? 'Reliability'
    : `Reliability · ${crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : 'All lines'}`;
  const props = { reliability, agg, startDate, endDate };

  return (
    <PageWrapper pageTitle={title}>
      <ChartPageDiv>
        {isRide ? <TheRideReliability {...props} /> : <CommuterRailReliability {...props} />}
        <DataNotes>
          {isRide ? (
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

ReliabilityDetails.Layout = Layout.Dashboard;

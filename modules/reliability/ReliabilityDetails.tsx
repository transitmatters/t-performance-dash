'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useReliabilityData } from '../../common/api/hooks/reliability';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { TheRideReliability } from './TheRideReliability';
import { CommuterRailReliability } from './CommuterRailReliability';

// "commuter-rail" asks the API for every commuter rail route combined
const ALL_COMMUTER_RAIL = 'commuter-rail';

export function ReliabilityDetails() {
  const { t } = useTranslation('reliability');
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
    ? t('pageTitle')
    : t('pageTitleScoped', {
        scope: crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : t('allLines'),
      });
  const props = { reliability, agg, startDate, endDate };

  return (
    <PageWrapper pageTitle={title}>
      <ChartPageDiv>
        {isRide ? <TheRideReliability {...props} /> : <CommuterRailReliability {...props} />}
        <DataNotes>
          {isRide ? (
            <>
              <p>{t('notes.ride.source')}</p>
              <p>{t('notes.ride.onTime')}</p>
            </>
          ) : (
            <p>{t('notes.commuterRail')}</p>
          )}
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}

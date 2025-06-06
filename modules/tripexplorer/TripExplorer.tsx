import React, { useEffect } from 'react';
import { useHistoricalAlertsData } from '../../common/api/hooks/alerts';
import { findMatch } from '../../common/components/alerts/AlertFilter';
import { AlertNotice } from '../../common/components/alerts/AlertNotice';
import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { Layout } from '../../common/layouts/layoutTypes';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getParentStationForStopId } from '../../common/utils/stations';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { GobbleDataNotice } from '../../common/components/notices/GobbleDataNotice';
import { BetaDataNotice } from '../../common/components/notices/BetaDataNotice';
import { PokeySchleppieAwardBanner } from '../../common/components/notices/PokeySchleppieAwardBanner';
import { CommuterRailDataNotice } from '../../common/components/notices/CommuterRailDataNotice';
import { BnrdBanner } from '../../common/components/notices/BnrdBanner';
import { useAlertStore } from './AlertStore';
import { TripGraphs } from './TripGraphs';

export const TripExplorer = () => {
  const {
    lineShort,
    query: { to, from, date, busRoute, crRoute },
  } = useDelimitatedRoute();
  const { data: alerts } = useHistoricalAlertsData(date, lineShort, busRoute, crRoute);

  const fromStation = from ? getParentStationForStopId(from, lineShort) : undefined;
  const toStation = to ? getParentStationForStopId(to, lineShort) : undefined;
  const alertsForModal = alerts?.filter(findMatch).map((alert) => {
    return { ...alert, applied: false };
  });
  const setAlerts = useAlertStore((store) => store.setAlerts);
  useEffect(() => {
    setAlerts(alertsForModal);
  }, [alertsForModal, setAlerts]);

  if (!(fromStation && toStation)) {
    return null;
  }

  return (
    <PageWrapper pageTitle={'Trips'}>
      <ChartPageDiv>
        <BetaDataNotice />
        {alertsForModal?.length ? <AlertNotice /> : null}
        <PokeySchleppieAwardBanner busRoute={busRoute} />
        <BnrdBanner busRoute={busRoute} />
        <TripGraphs fromStation={fromStation} toStation={toStation} />
        <div>
          <GobbleDataNotice />
          <BusDataNotice />
          <CommuterRailDataNotice />
          <SameDayNotice />
          <TerminusNotice toStation={toStation} fromStation={fromStation} />
        </div>
      </ChartPageDiv>
    </PageWrapper>
  );
};

TripExplorer.Layout = Layout.Dashboard;

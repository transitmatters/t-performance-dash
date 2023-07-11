import React, { useEffect, useMemo, useState } from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getParentStationForStopId } from '../../common/utils/stations';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { AlertBar } from '../../common/components/alerts/AlertBar';
import { TripGraphs } from './TripGraphs';
import { AlertNotice } from '../../common/components/alerts/AlertNotice';
import { useHistoricalAlertsData } from '../../common/api/hooks/alerts';
import { findMatch } from '../../common/components/alerts/AlertFilter';
import { useAlertStore } from './AlertStore';

export const TripExplorer = () => {
  const {
    lineShort,
    query: { to, from, date, busRoute },
  } = useDelimitatedRoute();
  const { data: alerts } = useHistoricalAlertsData(date, lineShort, busRoute);

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;
  const alertsForModal = alerts?.filter(findMatch).map((alert) => {
    return { ...alert, applied: false };
  });
  const setAlerts = useAlertStore((store) => store.setAlerts);
  useEffect(() => {
    setAlerts(alertsForModal);
  }, [alertsForModal]);

  if (!(fromStation && toStation)) {
    return null;
  }
  return (
    <PageWrapper pageTitle={'Trips'}>
      <div className="flex flex-col gap-4">
        {alertsForModal?.length > 0 ? <AlertNotice /> : null}
        <TripGraphs fromStation={fromStation} toStation={toStation} />
        <SameDayNotice />
        <TerminusNotice toStation={toStation} fromStation={fromStation} />
      </div>
    </PageWrapper>
  );
};
TripExplorer.Layout = Layout.Dashboard;

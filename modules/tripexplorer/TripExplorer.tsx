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
import { TripDataNotes } from '../../common/components/notices/TripDataNotes';
import { CrBetaAccuracyNotice } from '../../common/components/notices/CrBetaAccuracyNotice';
import { PokeySchleppieAwardBanner } from '../../common/components/notices/PokeySchleppieAwardBanner';
import { BnrdBanner } from '../../common/components/notices/BnrdBanner';
import { useAlertStore } from './AlertStore';
import { TripGraphs } from './TripGraphs';
import { TripSetupNotice } from './TripSetupNotice';
import { TripGraphsBoundary } from './TripGraphsBoundary';

const describeDates = (date?: string, startDate?: string, endDate?: string) => {
  if (date) return ` on ${date}`;
  if (startDate && endDate) return ` from ${startDate} to ${endDate}`;
  if (startDate) return ` since ${startDate}`;
  return '';
};

export const TripExplorer = () => {
  const {
    lineShort,
    page,
    query: { to, from, date, startDate, endDate, busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const pageTitle = page === 'multiTrips' ? 'Trips over a date range' : 'Trips on a single day';
  const { data: alerts } = useHistoricalAlertsData(date, lineShort, busRoute, crRoute, ferryRoute);

  const fromStation = from ? getParentStationForStopId(from, lineShort) : undefined;
  const toStation = to ? getParentStationForStopId(to, lineShort) : undefined;
  const alertsForModal = alerts?.filter(findMatch).map((alert) => {
    return { ...alert, applied: false };
  });
  const setAlerts = useAlertStore((store) => store.setAlerts);
  useEffect(() => {
    setAlerts(alertsForModal);
  }, [alertsForModal, setAlerts]);

  return (
    <PageWrapper pageTitle={pageTitle}>
      <ChartPageDiv>
        {fromStation && toStation ? (
          <>
            {/* Changing a station or a date silently swaps every chart on the page. This is the
                only thing that says so to a screen reader. */}
            <div aria-live="polite" className="sr-only">
              {`Showing ${fromStation.stop_name} to ${toStation.stop_name}${describeDates(date, startDate, endDate)}.`}
            </div>
            {alertsForModal?.length ? <AlertNotice count={alertsForModal.length} /> : null}
            <PokeySchleppieAwardBanner busRoute={busRoute} />
            <BnrdBanner busRoute={busRoute} />
            {/* Urgent, per-view accuracy warnings stay visible with the charts. */}
            <div className="flex flex-col gap-2 empty:hidden">
              <CrBetaAccuracyNotice />
              <SameDayNotice />
              <TerminusNotice toStation={toStation} fromStation={fromStation} />
            </div>
            <TripGraphsBoundary>
              <TripGraphs fromStation={fromStation} toStation={toStation} />
            </TripGraphsBoundary>
            {/* Provenance / context, collapsed by default. */}
            <TripDataNotes />
          </>
        ) : (
          <TripSetupNotice missing="stations" />
        )}
      </ChartPageDiv>
    </PageWrapper>
  );
};

TripExplorer.Layout = Layout.Dashboard;

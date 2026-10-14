import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { i18n } from '../../common/i18n';
import { useHistoricalAlertsData } from '../../common/api/hooks/alerts';
import { findMatch } from '../../common/components/alerts/AlertFilter';
import { AlertNotice } from '../../common/components/alerts/AlertNotice';
import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
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

/** Announces the trip on screen, for screen readers. */
const describeTrip = (
  from: string,
  to: string,
  date?: string,
  startDate?: string,
  endDate?: string
) => {
  if (date) return i18n.t('tripexplorer:showing.onDate', { from, to, date });
  if (startDate && endDate)
    return i18n.t('tripexplorer:showing.dateRange', { from, to, startDate, endDate });
  if (startDate) return i18n.t('tripexplorer:showing.since', { from, to, startDate });
  return i18n.t('tripexplorer:showing.trip', { from, to });
};

export const TripExplorer = () => {
  const { t } = useTranslation('tripexplorer');
  const {
    lineShort,
    page,
    query: { to, from, date, startDate, endDate, busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const pageTitle = page === 'multiTrips' ? t('pageTitle.multi') : t('pageTitle.single');
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
              {describeTrip(fromStation.stop_name, toStation.stop_name, date, startDate, endDate)}
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

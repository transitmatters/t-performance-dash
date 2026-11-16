import { useEffect, useMemo } from 'react';
import { useHistoricalAlertsData } from '../../common/api/hooks/alerts';
import { findMatch } from '../../common/components/alerts/AlertFilter';
import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { CoverageGapNotice } from '../../common/components/notices/CoverageGapNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getStationInOptions, optionsStation } from '../../common/utils/stations';
import { TripDataNotes } from '../../common/components/notices/TripDataNotes';
import { BetaAccuracyNotice } from '../../common/components/notices/BetaAccuracyNotice';
import { PokeySchleppieAwardBanner } from '../../common/components/notices/PokeySchleppieAwardBanner';
import { BnrdBanner } from '../../common/components/notices/BnrdBanner';
import { useAlertStore } from './AlertStore';
import { TripGraphs } from './TripGraphs';
import { TripSetupNotice } from './TripSetupNotice';
import { TripGraphsBoundary } from './TripGraphsBoundary';
import { ComparisonSelector } from './ComparisonSelector';

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
  const { data: alerts, isLoading: isAlertsLoading } = useHistoricalAlertsData(
    date,
    lineShort,
    busRoute,
    crRoute,
    ferryRoute
  );

  // Stops from another line wait here until the station selector swaps in this line's defaults.
  const stations = optionsStation(lineShort, busRoute, crRoute, ferryRoute);
  const fromStation = getStationInOptions(from, stations);
  const toStation = getStationInOptions(to, stations);
  const matchingAlerts = useMemo(() => alerts?.filter(findMatch), [alerts]);
  const setAlerts = useAlertStore((store) => store.setAlerts);
  useEffect(() => {
    setAlerts(matchingAlerts, isAlertsLoading);
  }, [matchingAlerts, isAlertsLoading, setAlerts]);

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
            {busRoute && <PokeySchleppieAwardBanner busRoute={busRoute} />}
            <BnrdBanner busRoute={busRoute} />
            {/* Urgent, per-view accuracy warnings stay visible with the charts. */}
            <div className="flex flex-col gap-2 empty:hidden">
              <BetaAccuracyNotice />
              <SameDayNotice />
              <CoverageGapNotice />
              <TerminusNotice toStation={toStation} fromStation={fromStation} />
            </div>
            {page === 'multiTrips' && <ComparisonSelector />}
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

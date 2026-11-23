import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { CoverageGapNotice } from '../../common/components/notices/CoverageGapNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getStationInOptions, optionsStation } from '../../common/utils/stations';
import { TripDataNotes } from '../../common/components/notices/TripDataNotes';
import { BetaAccuracyNotice } from '../../common/components/notices/BetaAccuracyNotice';
import { PokeySchleppieAwardBanner } from '../../common/components/notices/PokeySchleppieAwardBanner';
import { BnrdBanner } from '../../common/components/notices/BnrdBanner';
import { TripGraphs, TripSlowZonesBanner } from './TripGraphs';
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
    query: { to, from, date, startDate, endDate, busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  // Stops from another line wait here until the station selector swaps in this line's defaults.
  const stations = optionsStation(lineShort, busRoute, crRoute, ferryRoute);
  const fromStation = getStationInOptions(from, stations);
  const toStation = getStationInOptions(to, stations);

  return (
    <>
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
            {/* One-line notices sit closer to the charts they describe than cards sit to each other. */}
            <div className="flex flex-col gap-4">
              {/* Urgent, per-view accuracy warnings stay visible with the charts. */}
              <div className="flex flex-col gap-4 empty:hidden">
                <BetaAccuracyNotice />
                <SameDayNotice />
                <CoverageGapNotice />
                <TerminusNotice toStation={toStation} fromStation={fromStation} />
                <TripSlowZonesBanner fromStation={fromStation} toStation={toStation} />
              </div>
              <TripGraphsBoundary>
                <ChartPageDiv>
                  <TripGraphs fromStation={fromStation} toStation={toStation} />
                </ChartPageDiv>
              </TripGraphsBoundary>
            </div>
            {/* Provenance / context, collapsed by default. */}
            <TripDataNotes />
          </>
        ) : (
          <TripSetupNotice missing="stations" />
        )}
      </ChartPageDiv>
    </>
  );
};

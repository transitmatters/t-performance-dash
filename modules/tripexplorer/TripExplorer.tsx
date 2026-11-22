import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { CoverageGapNotice } from '../../common/components/notices/CoverageGapNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useTripSelection } from '../../common/hooks/usePageParams';
import type { PageDates } from '../../common/utils/pageParams';
import { TripDataNotes } from '../../common/components/notices/TripDataNotes';
import { BetaAccuracyNotice } from '../../common/components/notices/BetaAccuracyNotice';
import { PokeySchleppieAwardBanner } from '../../common/components/notices/PokeySchleppieAwardBanner';
import { BnrdBanner } from '../../common/components/notices/BnrdBanner';
import { TripGraphs, TripSlowZonesBanner } from './TripGraphs';
import { TripSetupNotice } from './TripSetupNotice';
import { TripGraphsBoundary } from './TripGraphsBoundary';

const describeDates = (dates: PageDates) =>
  dates.kind === 'single' ? `on ${dates.date}` : `from ${dates.startDate} to ${dates.endDate}`;

export const TripExplorer = () => {
  const trip = useTripSelection();
  if (!trip) {
    return (
      <ChartPageDiv>
        <TripSetupNotice />
      </ChartPageDiv>
    );
  }
  const { fromStation, toStation, dates, busRoute } = trip;

  return (
    <ChartPageDiv>
      {/* Changing a station or a date silently swaps every chart on the page. This is the
          only thing that says so to a screen reader. */}
      <div aria-live="polite" className="sr-only">
        {`Showing ${fromStation.stop_name} to ${toStation.stop_name} ${describeDates(dates)}.`}
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
          <TripSlowZonesBanner />
        </div>
        <TripGraphsBoundary>
          <ChartPageDiv>
            <TripGraphs />
          </ChartPageDiv>
        </TripGraphsBoundary>
      </div>
      <TripDataNotes />
    </ChartPageDiv>
  );
};

import { useDelimitatedRoute } from '../../utils/router';
import { DataNotes } from './DataNotes';
import { BetaDataNotice } from './BetaDataNotice';
import { GobbleDataNotice } from './GobbleDataNotice';
import { BusDataNotice } from './BusDataNotice';

/** How the headway chart's Bunched and On time figures are counted. */
const HeadwayNotes = ({ isBus }: { isBus: boolean }) => (
  <>
    <p className="font-medium text-foreground">Bunched and On time headways</p>
    <p>
      A headway is the time between back-to-back departures at the selected stop. It&apos;s bunched
      when it&apos;s half the scheduled headway or less, and on time when it&apos;s within 25% of
      the scheduled headway. Both are shares of every headway at that stop, added up across days
      rather than averaging each day.
    </p>
    <p>
      Headways with no scheduled headway still count toward the total, so they lower both shares.
      Headways over 2 hours are left out, except on Commuter Rail.
      {isBus &&
        ' Other bunching trackers may count bunching across a whole route, so their figures can differ from these per-stop ones.'}
    </p>
  </>
);

/**
 * Collapsed-by-default "About this data" section for how the figures are counted and
 * provenance caveats (how the data is collected, known coverage gaps). The urgent per-view
 * accuracy warnings — same-day and terminus — stay visible with the charts instead (see
 * TripExplorer).
 */
export const TripDataNotes = () => {
  const { line, linePath } = useDelimitatedRoute();
  const isBus = line === 'line-bus' || linePath === 'bus';

  return (
    <DataNotes>
      <HeadwayNotes isBus={isBus} />
      <BetaDataNotice />
      <GobbleDataNotice />
      <BusDataNotice />
    </DataNotes>
  );
};

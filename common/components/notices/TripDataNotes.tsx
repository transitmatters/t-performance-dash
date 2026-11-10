import { POKEY_SCHLEPPIE_AWARDS } from '../../constants/pokeySchleppie';
import { useDelimitatedRoute } from '../../utils/router';
import { Link } from '../general/Link';
import { DataNotes } from './DataNotes';
import { BetaDataNotice } from './BetaDataNotice';
import { GobbleDataNotice } from './GobbleDataNotice';
import { BusDataNotice } from './BusDataNotice';

const LATEST_AWARDS_YEAR = Math.max(...Object.keys(POKEY_SCHLEPPIE_AWARDS).map(Number));

/** How the headway chart's Bunched and On time figures are counted. */
const HeadwayNotes = ({ isBus }: { isBus: boolean }) => (
  <>
    <p className="font-medium text-foreground">Bunched and On time headways</p>
    <p>
      A headway is the time between back-to-back departures at the selected stop, so these figures
      are for that stop, not the whole route. It&apos;s bunched when it&apos;s half the scheduled
      headway or less, and on time when it&apos;s within 25% of the scheduled headway. Both are
      shares of the headways at that stop, added up across days rather than averaging each day.
    </p>
    <p>
      Headways with no scheduled headway are left out. The subway has none before 2021, so these
      figures don&apos;t show for earlier dates. Headways over 2 hours are left out too, except on
      Commuter Rail.
    </p>
    {isBus && (
      <p>
        TransitMatters&apos;{' '}
        <Link
          href={POKEY_SCHLEPPIE_AWARDS[LATEST_AWARDS_YEAR].url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Pokey/Schleppie Awards
        </Link>{' '}
        measure bunching differently. A bus counts as bunched when its headway is under 25% of the
        scheduled headway rather than 50%, and a route&apos;s rate covers every timepoint in both
        directions on October weekdays, 7 AM to 7 PM. With the stricter cut-off, the same buses give
        a lower rate than the Bunched figure here.
      </p>
    )}
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

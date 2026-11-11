import { Link } from '../../../common/components/general/Link';
import { getBusSpeedMapRouteHref, useDelimitatedRoute } from '../../../common/utils/router';
import { MIN_DWELL_STOPS_PER_DAY } from '../constants';
import type { GroupedBusSpeedLeaderboardEntry } from '../utils';
import { averageDwell, dwellShare, summarizeDwell } from '../utils';

const formatSeconds = (seconds: number) => `${Math.round(seconds)}s`;
const formatShare = (share: number) => `${Math.round(share * 100)}%`;

interface DwellListProps {
  title: string;
  caption: string;
  entries: GroupedBusSpeedLeaderboardEntry[];
  value: (entry: GroupedBusSpeedLeaderboardEntry) => string;
}

const DwellList = ({ title, caption, entries, value }: DwellListProps) => {
  const route = useDelimitatedRoute();
  return (
    <div className="flex flex-col">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground">{caption}</p>
      <ol className="mt-1 flex flex-col divide-y divide-border">
        {entries.map((entry, index) => (
          <li key={entry.route}>
            <Link
              href={getBusSpeedMapRouteHref(entry.route, route)}
              className="flex items-center justify-between gap-4 py-1.5 text-sm hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-right text-muted-foreground">{index + 1}</span>
                <span className="text-foreground">Route {entry.route}</span>
              </span>
              <span className="font-semibold text-foreground tabular-nums">{value(entry)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
};

interface BusDwellSummaryProps {
  /** The routes the leaderboard is ranking, already grouped and filtered. */
  data: GroupedBusSpeedLeaderboardEntry[];
}

/** A short look at time at stops, below the slowest routes. */
export const BusDwellSummary = ({ data }: BusDwellSummaryProps) => {
  const { overall, byAverageDwell, byDwellShare } = summarizeDwell(data);
  if (!overall || byAverageDwell.length < 1) return null;

  return (
    <section className="mt-2 flex flex-col gap-3 border-t border-border pt-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Time at stops</h3>
        <p className="text-sm text-muted-foreground">
          Across these routes, buses spent an average of {formatSeconds(overall.averageDwell)} at
          each stop, {formatShare(overall.dwellShare)} of their time.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DwellList
          title="Longest stops"
          caption="Average time at each stop"
          entries={byAverageDwell}
          value={(entry) => formatSeconds(averageDwell(entry))}
        />
        <DwellList
          title="Most time at stops"
          caption="Share of the route's time. Higher where stops are close together."
          entries={byDwellShare}
          value={(entry) => formatShare(dwellShare(entry))}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Time around each stop, so slow traffic near a stop counts as well as time with the doors
        open. Each trip&apos;s first stop is left out, and so are routes serving fewer than{' '}
        {MIN_DWELL_STOPS_PER_DAY} stops a day.
      </p>
    </section>
  );
};

import { useOverviewData } from '../../common/api/hooks/overview';
import { Link } from '../../common/components/general/Link';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { METRICS, METRIC_ORDER } from '../home/config';
import type { RowMode } from '../home/config';
import { STATUS_LABELS } from '../home/copy';
import { formatThreshold } from '../home/format';
import { StatusNode } from '../home/components/StatusNode';
import type { MetricId, Status } from '../home/types';
import { thresholdGroups } from './thresholds';
import type { ThresholdGroup } from './thresholds';

const MODE_LABELS: Record<RowMode, string> = {
  subway: 'Subway',
  commuterRail: 'Commuter Rail',
  frequentBus: 'Frequent Bus',
  bus: 'All Bus',
  ferry: 'Ferry',
};

const STATUSES: { status: Status; meaning: string }[] = [
  { status: 'win', meaning: 'At or past the goal.' },
  { status: 'good', meaning: 'Close to the goal.' },
  { status: 'room', meaning: 'Short of the goal, but not far.' },
  { status: 'problem', meaning: 'Well short of the goal.' },
  {
    status: 'insufficient',
    meaning:
      'Should be measured, but there are too few recent weeks of data, or the latest data is too old to judge.',
  },
  {
    status: 'na',
    meaning: "Not measured for this line or mode (yet). It doesn't count either way.",
  },
];

/** Modes that share a definition are listed together, so the same text isn't repeated. */
const definitionsByText = (metric: MetricId) => {
  const byText = new Map<string, RowMode[]>();
  for (const [mode, text] of Object.entries(METRICS[metric].definitions) as [RowMode, string][]) {
    byText.set(text, [...(byText.get(text) ?? []), mode]);
  }
  return [...byText.entries()];
};

const ThresholdTable = ({ groups }: { groups: ThresholdGroup[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-md text-left text-sm">
      <thead className="text-xs text-muted-foreground">
        <tr className="border-b">
          <th scope="col" className="py-1.5 pr-3 font-medium">
            Applies to
          </th>
          {(['win', 'good', 'room'] as const).map((status) => (
            <th key={status} scope="col" className="px-3 py-1.5 font-medium whitespace-nowrap">
              {STATUS_LABELS[status]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groups.map((group) => {
          const op = group.direction === 'higher' ? '≥' : '≤';
          return (
            <tr key={`${group.part}-${group.rows.join()}`} className="border-b last:border-0">
              <td className="py-1.5 pr-3">
                {group.part && <span className="font-medium">{group.part}: </span>}
                {group.rows.join(', ')}
              </td>
              {group.thresholds.map((threshold, i) => (
                <td key={i} className="px-3 py-1.5 tabular-nums">
                  {op}
                  {formatThreshold(threshold, group.scoreUnit)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const MetricSection = ({ metric, groups }: { metric: MetricId; groups: ThresholdGroup[] }) => (
  <section id={metric} className="flex scroll-mt-20 flex-col gap-3">
    <h2 className="text-lg font-semibold">{METRICS[metric].label}</h2>
    <dl className="flex flex-col gap-2 text-sm">
      {definitionsByText(metric).map(([text, modes]) => (
        <div key={text}>
          <dt className="font-medium">{modes.map((mode) => MODE_LABELS[mode]).join(', ')}</dt>
          <dd className="text-muted-foreground">{text}</dd>
        </div>
      ))}
    </dl>
    {groups.length > 0 && <ThresholdTable groups={groups} />}
  </section>
);

export function Methodology() {
  const { data } = useOverviewData();

  return (
    <PageWrapper pageTitle="How We Measure">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold sm:text-3xl">How we measure</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            The <Link href="/">home page scoreboard</Link> judges each line on {METRIC_ORDER.length}{' '}
            measures. TransitMatters computes them every morning from the same data as the rest of
            the dashboard, and the code is{' '}
            <a
              href="https://github.com/transitmatters/data-ingestion/tree/main/ingestor/chalicelib/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              open source
            </a>
            .
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Statuses</h2>
          <p className="text-sm text-muted-foreground">
            Each measure gets a status from the cut-offs listed with it below. A line&apos;s overall
            status is its worst measured status. There&apos;s no averaging, so one weak measure is
            enough to hold a line back.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {STATUSES.map(({ status, meaning }) => (
              <li key={status} className="flex items-start gap-2">
                <span className="mt-0.5 flex w-5 shrink-0 justify-center">
                  <StatusNode status={status} className={status === 'na' ? undefined : 'size-4'} />
                </span>
                <span>
                  <span className="font-medium">{STATUS_LABELS[status]}.</span>{' '}
                  <span className="text-muted-foreground">{meaning}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {METRIC_ORDER.map((metric) => (
          <MetricSection key={metric} metric={metric} groups={thresholdGroups(data, metric)} />
        ))}

        <section id="headways" className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="text-lg font-semibold">Bunched and on time headways</h2>
          <p className="text-sm text-muted-foreground">
            The headway charts on each line&apos;s pages count the time between back-to-back
            departures at the selected stop, compared with the MBTA&apos;s scheduled headway there.
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Bunched:</span> the actual headway is
              half the scheduled one or less.
            </li>
            <li>
              <span className="font-medium text-foreground">On time:</span> the actual headway is
              within 25% of the scheduled one (more than 75% and less than 125%).
            </li>
            <li>
              Percentages are of every headway at that stop. Over several days, headways are added
              up across days rather than averaging each day&apos;s percentage.
            </li>
            <li>
              Headways with no scheduled headway still count toward the total, so they lower both
              percentages. Headways over 2 hours are left out, except on Commuter Rail.
            </li>
            <li>
              These are per-stop numbers, not trips along the whole route. Other bunching figures,
              like the MBTA&apos;s or other trackers&apos;, may be counted differently.
            </li>
          </ul>
        </section>
      </div>
    </PageWrapper>
  );
}

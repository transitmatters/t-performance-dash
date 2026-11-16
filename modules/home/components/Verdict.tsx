import { ArrowRight } from 'lucide-react';
import { Link } from '../../../common/components/general/Link';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { cn } from '../../../common/utils/cn';
import { METRICS } from '../config';
import { HEADLINE_LABELS } from '../copy';
import { HEADLINE_TONE, STATUS_NODE_TONE } from '../format';
import { VERDICT_GROUPS, describeProblem, summarize } from '../summary';
import type { Summary, VerdictGroup } from '../summary';
import type { HeadlineKind, Row } from '../types';
import type { HomeState } from '../useHomeData';
import { Placeholder } from './Placeholder';
import { StatusNode } from './StatusNode';

const GROUP_LABEL: Record<VerdictGroup, string> = {
  needsWork: HEADLINE_LABELS.needsWork,
  room: HEADLINE_LABELS.room,
  onTrack: 'On track',
};

const GROUP_TONE: Record<VerdictGroup, HeadlineKind> = {
  needsWork: 'needsWork',
  room: 'room',
  onTrack: 'good',
};

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const headline = ({ judged, groups }: Summary) => {
  const needs = groups.needsWork.length;
  const room = groups.room.length;
  if (needs > 0) return `${needs} of ${judged} lines ${plural(needs, 'needs', 'need')} work.`;
  if (room > 0) return `No line needs work, and ${room} of ${judged} have room to grow.`;
  return `All ${judged} lines are on track.`;
};

const subhead = ({ commonProblem }: Summary) =>
  commonProblem
    ? `${METRICS[commonProblem.metric].label} is the most common weak spot, on ${commonProblem.lines} ${plural(commonProblem.lines, 'line', 'lines')}.`
    : 'No line falls short on the service riders get today.';

const LineList = ({ summary }: { summary: Summary }) => (
  <dl className="flex flex-col gap-2.5">
    {VERDICT_GROUPS.map((group) => (
      <div key={group} className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
        <dt className="shrink-0 sm:w-28">
          <span
            className={cn(
              'inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
              HEADLINE_TONE[GROUP_TONE[group]]
            )}
          >
            {GROUP_LABEL[group]}
          </span>
        </dt>
        <dd className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {summary.groups[group].length === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : (
            summary.groups[group].map((config) => (
              <Link
                key={config.id}
                href={config.href}
                data-line={config.line}
                className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
              >
                <span className="text-primary">
                  <RouteBullet size="sm" />
                </span>
                {config.label}
              </Link>
            ))
          )}
        </dd>
      </div>
    ))}
  </dl>
);

const Problems = ({ summary }: { summary: Summary }) =>
  summary.problems.length === 0 ? (
    <p className="text-sm text-muted-foreground">Nothing riders feel needs work right now.</p>
  ) : (
    <ol className="flex flex-col">
      {summary.problems.map(({ config, cell }) => (
        <li key={config.id} data-line={config.line} className="border-b last:border-0">
          <Link
            href={cell.href ?? config.href}
            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className={STATUS_NODE_TONE.problem}>
              <StatusNode status="problem" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-primary">
                  <RouteBullet size="sm" />
                </span>
                {config.label} · {METRICS[cell.metric].label}
              </span>
              <span className="text-sm text-muted-foreground">
                {describeProblem(cell, config.mode)}
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ol>
  );

const Pending = ({ state }: { state: HomeState }) => {
  const pulse = state === 'loading';
  return (
    <>
      <div className="flex flex-col gap-4">
        <Placeholder className="h-8 w-64" pulse={pulse} />
        <Placeholder className="h-4 w-80 max-w-full" pulse={pulse} />
        <div className="flex flex-col gap-3">
          {VERDICT_GROUPS.map((g) => (
            <Placeholder key={g} className="h-5 w-72 max-w-full" pulse={pulse} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Placeholder className="h-4 w-32" pulse={pulse} />
        {[0, 1, 2].map((i) => (
          <Placeholder key={i} className="h-10 w-full" pulse={pulse} />
        ))}
      </div>
    </>
  );
};

/**
 * The page's answer to its own question: one sentence, every core line grouped by its verdict,
 * and the worst few problems riders feel, each a link to the page that explains it.
 */
export const Verdict = ({ rows, state }: { rows?: Row[]; state: HomeState }) => {
  const summary = rows ? summarize(rows) : undefined;
  return (
    <section
      aria-labelledby="verdict-title"
      aria-busy={state === 'loading'}
      className="grid gap-8 border-y py-6 lg:grid-cols-2 lg:gap-12"
    >
      {summary ? (
        <>
          <div className="tm-fade-in flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2
                id="verdict-title"
                className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
              >
                {headline(summary)}
              </h2>
              <p className="text-muted-foreground">{subhead(summary)}</p>
            </div>
            <LineList summary={summary} />
          </div>
          <div className="tm-fade-in flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Biggest problems</h3>
            <Problems summary={summary} />
          </div>
        </>
      ) : (
        <>
          <h2 id="verdict-title" className="sr-only">
            Today's verdict
          </h2>
          <Pending state={state} />
        </>
      )}
    </section>
  );
};

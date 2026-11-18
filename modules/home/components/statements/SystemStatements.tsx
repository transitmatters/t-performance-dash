import { Link } from '../../../../common/components/general/Link';
import { cn } from '../../../../common/utils/cn';
import type { Statement } from '../../statements';
import type { HomeState } from '../../useHomeData';
import { Placeholder } from '../Placeholder';
import { StatementViz } from './StatementViz';

const StatementText = ({ statement, lead }: { statement: Statement; lead: boolean }) => (
  <div className="flex flex-col gap-2.5">
    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
      {statement.kicker}
    </span>
    <h3
      className={cn(
        'font-bold tracking-tight text-balance',
        lead ? 'text-2xl md:text-3xl' : 'text-xl'
      )}
    >
      {statement.head}
    </h3>
    <p className="max-w-[60ch] text-muted-foreground">{statement.body}</p>
    <Link
      href={statement.link.href}
      className="self-start text-sm font-semibold underline-offset-4 hover:underline"
    >
      {statement.link.label} <span aria-hidden="true">→</span>
    </Link>
  </div>
);

const Pending = ({ pulse }: { pulse: boolean }) => (
  <div className="flex flex-col gap-3 border-t py-6" aria-hidden="true">
    <Placeholder className="h-3 w-20" pulse={pulse} />
    <Placeholder className="h-6 w-4/5" pulse={pulse} />
    <Placeholder className="h-4 w-3/5" pulse={pulse} />
    <Placeholder className="h-24 w-full" pulse={pulse} />
  </div>
);

/** What the report card adds up to across the whole system, a measure at a time. */
export const SystemStatements = ({
  statements,
  state,
}: {
  statements: Statement[];
  state: HomeState;
}) => {
  if (state === 'ready' && statements.length === 0) return null;
  return (
    <section id="system" aria-labelledby="system-heading" className="scroll-mt-6 pt-4">
      <div className="mb-2 flex flex-col gap-1">
        <h2 id="system-heading" className="text-2xl font-bold tracking-tight">
          Across the system
        </h2>
        <p className="max-w-[70ch] text-muted-foreground">
          What the report card below adds up to, a measure at a time. Every sentence is filled in
          from the latest data each day.
        </p>
      </div>
      <div className="grid gap-x-12 md:grid-cols-2" aria-busy={state === 'loading'}>
        {state === 'ready'
          ? statements.map((statement, i) => (
              <article
                key={statement.id}
                className={cn(
                  'tm-fade-in flex min-w-0 flex-col gap-2.5 border-t py-6',
                  // The first statement leads, across the full width.
                  i === 0 &&
                    'md:col-span-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12'
                )}
              >
                <StatementText statement={statement} lead={i === 0} />
                <StatementViz viz={statement.viz} />
              </article>
            ))
          : state === 'loading' && [0, 1, 2].map((i) => <Pending key={i} pulse />)}
      </div>
    </section>
  );
};

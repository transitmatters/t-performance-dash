import { Code, HandHeart } from 'lucide-react';

const OTHER_REPOS = [
  { name: 'gobble', href: 'https://github.com/transitmatters/gobble' },
  { name: 'data-ingestion', href: 'https://github.com/transitmatters/data-ingestion' },
  { name: 'mbta-performance', href: 'https://github.com/transitmatters/mbta-performance' },
  { name: 'stripmap', href: 'https://github.com/transitmatters/stripmap' },
];

const linkClass =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

export const OpenSourceBanner = ({ packageCount }: { packageCount: number }) => (
  <section
    aria-labelledby="opensource-title"
    className="flex flex-col gap-5 rounded-xl bg-card px-6 py-6 ring-1 ring-foreground/10 sm:px-8"
  >
    <div className="flex max-w-3xl flex-col gap-2">
      <h1 id="opensource-title" className="text-2xl font-bold sm:text-3xl">
        Built in the open
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        The Data Dashboard is open source under the MIT license. Volunteers build it in public, so
        anyone can read the code, check how a number is calculated, or suggest a fix.
      </p>
      <p className="text-sm text-muted-foreground sm:text-base">
        It's also built on the {packageCount.toLocaleString()} open source projects listed below.
        We're grateful to every maintainer and contributor behind them.
      </p>
    </div>
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href="https://github.com/transitmatters/t-performance-dash"
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkClass} bg-foreground hover:bg-foreground/85`}
      >
        {/* Colored on the span: the global `a { color: inherit }` beats utility classes on links. */}
        <span className="inline-flex items-center gap-2 text-background">
          <Code className="size-4" aria-hidden />
          View the source
        </span>
      </a>
      <a
        href="https://transitmatters.org/volunteer"
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkClass} ring-1 ring-border hover:bg-muted`}
      >
        <HandHeart className="size-4" aria-hidden />
        Volunteer with us
      </a>
    </div>
    <p className="text-xs text-muted-foreground">
      More from TransitMatters Labs:{' '}
      {OTHER_REPOS.map((repo) => (
        <span key={repo.name}>
          <a
            href={repo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            <span className="text-foreground">{repo.name}</span>
          </a>
          {', '}
        </span>
      ))}
      <a
        href="https://github.com/transitmatters"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium hover:underline"
      >
        <span className="text-foreground">and more on GitHub</span>
      </a>
      .
    </p>
  </section>
);

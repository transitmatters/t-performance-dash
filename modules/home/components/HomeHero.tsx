import React from 'react';
import dayjs from 'dayjs';
import { RollingNumber } from '../../../common/components/motion/RollingNumber';
import { cn } from '../../../common/utils/cn';
import { HERO } from '../config';
import type { HeroConfig } from '../config';
import { formatTrend, formatValue, trendSentiment } from '../format';
import type { HeroStat } from '../types';
import type { HomeState } from '../useHomeData';
import { Placeholder } from './Placeholder';

// The strip across the top: one segment per mode, in the T's own colors.
const STRIPE = ['#da291c', '#ed8b00', '#003da5', '#00843d', '#80276c', '#ffc72c', '#008eaa'];

const HeroValue: React.FC<{ config: HeroConfig; stat?: HeroStat; state: HomeState }> = ({
  config,
  stat,
  state,
}) => {
  const className = 'text-3xl font-semibold tracking-tight tabular-nums';
  if (stat && stat.value !== null) {
    return (
      <RollingNumber
        value={stat.value}
        format={(v) => formatValue(v, config.unit)}
        className={cn('tm-fade-in', className)}
      />
    );
  }
  return (
    <span className={cn('text-muted-foreground', className)}>
      {stat || state === 'error' ? '—' : <Placeholder className="h-7 w-24" />}
    </span>
  );
};

const HeroTile: React.FC<{
  config: HeroConfig;
  stat?: HeroStat;
  state: HomeState;
  index: number;
}> = ({ config, stat, state, index }) => {
  const trend = stat?.trend !== undefined ? formatTrend({ trend: stat.trend ?? null }) : null;
  const sentiment = trendSentiment(stat?.trend ?? null, config.direction);
  return (
    <div
      className="tm-reveal @container flex flex-col gap-1 rounded-xl border bg-card p-4"
      style={{ '--reveal-index': index } as React.CSSProperties}
    >
      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
      <HeroValue config={config} stat={stat} state={state} />
      {config.detail && <span className="text-xs text-muted-foreground">{config.detail}</span>}
      {/* Kept even when empty, so a trend arriving with the data doesn't grow the tile. The trend
          wraps in a narrow tile, so it gets two lines there. */}
      <span
        className={cn(
          'min-h-8 text-xs @[11rem]:min-h-4',
          (trend || stat?.note) && 'tm-fade-in',
          trend ? 'font-medium' : 'text-muted-foreground',
          trend && sentiment === 'good' && 'text-green-700 dark:text-green-400',
          trend && sentiment === 'bad' && 'text-destructive',
          trend && sentiment === 'flat' && 'text-muted-foreground'
        )}
      >
        {trend ?? stat?.note}
      </span>
    </div>
  );
};

/** The page title and brand, shown whether or not the data has loaded. */
export const HomeTitle: React.FC<{ generatedAt?: string; failed?: boolean }> = ({
  generatedAt,
  failed,
}) => (
  <header className="flex flex-col gap-4">
    <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
      {STRIPE.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
    <div className="flex flex-col gap-1">
      <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {/* The charcoal wordmark disappears on the dark background, so swap in the white one. */}
        <img
          src="/Logo_wordmark.png"
          alt="TransitMatters"
          width={3204}
          height={301}
          fetchPriority="high"
          className="h-5 w-auto sm:h-6 dark:hidden"
        />
        <img
          src="/Logo_wordmark_white.png"
          alt="TransitMatters"
          width={3204}
          height={301}
          fetchPriority="high"
          className="hidden h-5 w-auto sm:h-6 dark:block"
        />
        <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase sm:text-base">
          Data Dashboard
        </span>
      </h1>
      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">How is the T doing?</p>
      <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
        Every line and mode, measured against the best it has done and the service riders need.{' '}
        {generatedAt ? (
          <span className="tm-fade-in">Updated {dayjs(generatedAt).format('MMMM D, YYYY')}.</span>
        ) : (
          <Placeholder className="h-3.5 w-36" pulse={!failed} />
        )}
      </p>
    </div>
  </header>
);

export const HomeHero: React.FC<{ stats?: HeroStat[]; state: HomeState }> = ({ stats, state }) => (
  <section
    aria-label="The T at a glance"
    aria-busy={state === 'loading'}
    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
  >
    {HERO.map((config, index) => (
      <HeroTile
        key={config.id}
        config={config}
        stat={stats?.find((stat) => stat.id === config.id)}
        state={state}
        index={index}
      />
    ))}
  </section>
);

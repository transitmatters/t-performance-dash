import React from 'react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { RollingNumber } from '../../../common/components/motion/RollingNumber';
import { cn } from '../../../common/utils/cn';
import { trendSentiment } from '../compute/series';
import { formatTrend, formatValue } from '../format';
import type { HeroStat } from '../types';

// The strip across the top: one segment per mode, in the T's own colors.
const STRIPE = ['#da291c', '#ed8b00', '#003da5', '#00843d', '#80276c', '#ffc72c', '#008eaa'];

const HeroTile: React.FC<{ stat: HeroStat; index: number }> = ({ stat, index }) => {
  const trend = stat.trend !== undefined ? formatTrend({ trend: stat.trend ?? null }) : null;
  const sentiment = trendSentiment(stat.trend ?? null, stat.direction);
  return (
    <div
      className="tm-reveal bg-card flex flex-col gap-1 rounded-xl border p-4"
      style={{ '--reveal-index': index } as React.CSSProperties}
    >
      <span className="text-muted-foreground text-xs font-medium">{stat.label}</span>
      {stat.value !== null ? (
        <RollingNumber
          value={stat.value}
          format={(v) => formatValue(v, stat.unit)}
          className="text-3xl font-semibold tracking-tight tabular-nums"
        />
      ) : (
        <span className="text-muted-foreground text-3xl font-semibold">—</span>
      )}
      {stat.detail && <span className="text-muted-foreground text-xs">{stat.detail}</span>}
      {trend && (
        <span
          className={cn(
            'text-xs font-medium',
            sentiment === 'good' && 'text-green-700 dark:text-green-400',
            sentiment === 'bad' && 'text-destructive',
            sentiment === 'flat' && 'text-muted-foreground'
          )}
        >
          {trend}
        </span>
      )}
    </div>
  );
};

/** The page title and brand, shown whether or not the data has loaded. */
export const HomeTitle: React.FC<{ generatedAt?: string }> = ({ generatedAt }) => (
  <header className="flex flex-col gap-4">
    <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
      {STRIPE.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
    <div className="flex flex-col gap-1">
      <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {/* The charcoal wordmark disappears on the dark background, so swap in the white one. */}
        <Image
          src="/Logo_wordmark.png"
          alt="TransitMatters"
          width={3204}
          height={301}
          priority
          className="h-5 w-auto sm:h-6 dark:hidden"
        />
        <Image
          src="/Logo_wordmark_white.png"
          alt="TransitMatters"
          width={3204}
          height={301}
          priority
          className="hidden h-5 w-auto sm:h-6 dark:block"
        />
        <span className="text-muted-foreground text-sm font-semibold tracking-widest uppercase sm:text-base">
          Data Dashboard
        </span>
      </h1>
      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">How is the T doing?</p>
      <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
        Every line and mode, measured against the best it has done and the service riders need.
        {generatedAt && ` Updated ${dayjs(generatedAt).format('MMMM D, YYYY')}.`}
      </p>
    </div>
  </header>
);

export const HomeHero: React.FC<{ stats: HeroStat[] }> = ({ stats }) => (
  <section
    aria-label="The T at a glance"
    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
  >
    {stats.map((stat, index) => (
      <HeroTile key={stat.id} stat={stat} index={index} />
    ))}
  </section>
);

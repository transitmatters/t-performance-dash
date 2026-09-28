import React from 'react';
import dayjs from 'dayjs';
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

export const HomeHero: React.FC<{ stats: HeroStat[]; generatedAt: string }> = ({
  stats,
  generatedAt,
}) => (
  <section aria-labelledby="home-title" className="flex flex-col gap-4">
    <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
      {STRIPE.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
    <div className="flex flex-col gap-1">
      <h1 id="home-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
        How is the T doing?
      </h1>
      <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
        Every line and mode, measured against the best it has done and the service riders need.
        Updated {dayjs(generatedAt).format('MMMM D, YYYY')}.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <HeroTile key={stat.id} stat={stat} index={index} />
      ))}
    </div>
  </section>
);

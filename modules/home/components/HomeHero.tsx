import dayjs from 'dayjs';
import { HeroChart } from './HeroChart';
import { Placeholder } from './Placeholder';

// The strip across the top: one segment per mode, in the T's own colors.
const STRIPE = ['#da291c', '#ed8b00', '#003da5', '#00843d', '#80276c', '#ffc72c', '#008eaa'];

interface HomeHeroProps {
  lede?: { lead: string; rest?: string };
  generatedAt?: string;
  failed?: boolean;
}

/**
 * The top of the page: the title, a one-line answer from the report card, and yesterday's
 * headways on the line that ran the most unevenly.
 */
export const HomeHero = ({ lede, generatedAt, failed }: HomeHeroProps) => (
  <header className="flex flex-col gap-6">
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
      <p className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
        How is the T doing?
      </p>
      <p className="mt-2 max-w-[48ch] text-lg leading-snug tracking-tight text-pretty sm:text-2xl">
        {lede ? (
          <span className="tm-fade-in">
            {lede.lead}
            {lede.rest && <span className="text-muted-foreground"> {lede.rest}</span>}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Every line and mode, measured against the best it has done and the service riders need.
          </span>
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        {generatedAt ? (
          <span className="tm-fade-in">Updated {dayjs(generatedAt).format('MMMM D, YYYY')}.</span>
        ) : (
          <Placeholder className="h-3.5 w-36" pulse={!failed} />
        )}
      </p>
    </div>
    <HeroChart />
  </header>
);

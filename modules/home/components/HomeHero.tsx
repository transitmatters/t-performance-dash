import dayjs from 'dayjs';
import { BadDayChart } from './badDay/BadDayChart';
import { Placeholder } from './Placeholder';

// The strip across the top: one segment per mode, in the T's own colors.
const STRIPE = ['#da291c', '#ed8b00', '#003da5', '#00843d', '#80276c', '#ffc72c', '#008eaa'];

const LINK =
  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none';

interface HomeHeroProps {
  lede?: { lead: string; rest?: string };
  generatedAt?: string;
  failed?: boolean;
}

/**
 * The top of the page, one dark look in both themes: the title, a one-line answer from the report
 * card, and a made-up bad day that shows off the charts. The title and chart render before the data.
 */
export const HomeHero = ({ lede, generatedAt, failed }: HomeHeroProps) => (
  <header className="flex flex-col gap-6 rounded-2xl bg-[#0d141d] px-4 py-6 text-[#f3f6fa] sm:px-6 sm:py-7 lg:px-8 dark:bg-[#0a1018] dark:ring-1 dark:ring-white/10">
    <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
      {STRIPE.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
    <div className="flex flex-col gap-1">
      <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <img
          src="/Logo_wordmark_white.png"
          alt="TransitMatters"
          width={3204}
          height={301}
          fetchPriority="high"
          className="h-5 w-auto sm:h-6"
        />
        <span className="text-sm font-semibold tracking-widest text-white/60 uppercase sm:text-base">
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
            {lede.rest && <span className="text-white/60"> {lede.rest}</span>}
          </span>
        ) : (
          <span className="text-white/60">
            Every line and mode, measured against the best it has done and the service riders need.
          </span>
        )}
      </p>
      <p className="text-sm text-white/60">
        {generatedAt ? (
          <span className="tm-fade-in">Updated {dayjs(generatedAt).format('MMMM D, YYYY')}.</span>
        ) : (
          <Placeholder className="h-3.5 w-36 bg-white/10" pulse={!failed} />
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {/* The global `a { color: inherit }` beats a text color on the link itself. */}
        <a href="#card" className={`${LINK} border-transparent bg-[#f3f6fa]`}>
          <span className="text-[#0d141d]">
            See every line <span aria-hidden="true">↓</span>
          </span>
        </a>
        <a href="#system" className={`${LINK} border-white/30 hover:bg-white/10`}>
          Across the system
        </a>
      </div>
    </div>
    <BadDayChart />
  </header>
);

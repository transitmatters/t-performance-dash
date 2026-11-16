import dayjs from 'dayjs';
import { Placeholder } from './Placeholder';

// The strip across the top: one segment per mode, in the T's own colors.
const STRIPE = ['#da291c', '#ed8b00', '#003da5', '#00843d', '#80276c', '#ffc72c', '#008eaa'];

/** The page title and brand, shown whether or not the data has loaded. */
export const HomeTitle = ({ generatedAt, failed }: { generatedAt?: string; failed?: boolean }) => (
  <header className="flex flex-col gap-4">
    <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
      {STRIPE.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">How is the T doing?</h1>
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

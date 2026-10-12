import React from 'react';
import { Heart } from 'lucide-react';

export const DonateCallout: React.FC = () => (
  <section
    aria-labelledby="donate-title"
    className="bg-tm-red flex flex-col gap-4 rounded-xl px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8"
  >
    <div className="flex max-w-2xl flex-col gap-1">
      <h2 id="donate-title" className="text-xl font-bold sm:text-2xl">
        Keep the data flowing
      </h2>
      <p className="text-sm text-white/85 sm:text-base">
        TransitMatters is a nonprofit fighting for better public transit in Boston. Volunteers build
        this dashboard, and your donation keeps it running.
      </p>
    </div>
    <a
      href="https://transitmatters.org/donate"
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-5 py-3 text-base font-semibold shadow-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none motion-reduce:hover:scale-100"
    >
      {/* Colored on the span: the global `a { color: inherit }` beats utility classes on links. */}
      <span className="text-tm-red inline-flex items-center gap-2">
        <Heart className="size-5 fill-current" aria-hidden />
        Donate to TransitMatters
      </span>
    </a>
  </section>
);

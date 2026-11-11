import type { ReactNode } from 'react';

/** A control with a small caps label: beside it in the header bar, above it in the mobile sheet. */
export const LabeledControl = ({ label, children }: { label: string; children: ReactNode }) => (
  <div
    role="group"
    aria-label={label}
    className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2"
  >
    <span
      aria-hidden
      className="text-xs font-semibold tracking-wide text-stone-600 uppercase dark:text-stone-400"
    >
      {label}
    </span>
    <div className="md:shrink-0">{children}</div>
  </div>
);

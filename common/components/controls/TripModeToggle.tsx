import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { TRIP_PAGES } from '../../constants/pages';
import { LINE_COLORS, LINE_COLORS_DARK } from '../../constants/colors';
import {
  buttonHighlightFocus,
  lineColorDarkBackground,
  lineColorLightBorder,
} from '../../styles/general';
import { readableOn } from '../../utils/general';
import { useDelimitatedRoute, useGenerateHref, useHandleConfigStore } from '../../utils/router';

/** Labelled for where they sit — beside the date control, which is what they change. */
const MODE_LABELS: Record<string, string> = {
  singleTrips: 'Single day',
  multiTrips: 'Date range',
};

/**
 * Switches between the two trip views. They are separate routes rendering the same component, told
 * apart only by which date params happen to be set, and until now the only path between them was a
 * sidebar item — behind a hamburger on mobile. Presenting them as two views of one surface makes
 * the relationship visible, and `getTripHopDates` keeps the selected day or range across the hop.
 */
export const TripModeToggle: React.FC = () => {
  const { line, page, query, linePath } = useDelimitatedRoute();
  const generateHref = useGenerateHref();
  const handlePageConfig = useHandleConfigStore();

  if (!line) return null;

  // The band behind the control and the selected segment's fill are different colors, so each
  // needs its own readable-text decision.
  const bandNeedsDarkText = readableOn(LINE_COLORS[line]) === 'dark';
  const fillNeedsDarkText = readableOn(LINE_COLORS_DARK[line]) === 'dark';

  return (
    <div
      role="group"
      aria-label="Trip view"
      className={classNames(
        'flex shrink-0 flex-row overflow-hidden rounded-md border',
        lineColorLightBorder[line ?? 'DEFAULT']
      )}
    >
      {TRIP_PAGES.map((tripPage) => {
        const selected = page === tripPage.key;
        return (
          <Link
            key={tripPage.key}
            href={generateHref(tripPage, page, query, linePath)}
            aria-current={selected ? 'page' : undefined}
            onClick={() => handlePageConfig(tripPage)}
            className={classNames(
              'flex h-10 items-center px-3 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-inset md:h-7',
              buttonHighlightFocus[line],
              selected
                ? classNames(
                    'font-semibold',
                    lineColorDarkBackground[line],
                    fillNeedsDarkText ? 'text-stone-900' : 'text-white'
                  )
                : classNames(
                    bandNeedsDarkText
                      ? 'text-stone-900 hover:bg-stone-900/10'
                      : 'text-white hover:bg-white/15'
                  )
            )}
          >
            {MODE_LABELS[tripPage.key] ?? tripPage.name}
          </Link>
        );
      })}
    </div>
  );
};

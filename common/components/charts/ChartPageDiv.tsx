import React from 'react';

interface ChartPageDivProps {
  children: React.ReactNode;
}

/**
 * The vertical stack every chart page is built from: notices, banners, cards and footnotes, on one
 * rhythm.
 *
 * The gap is a flex gap on the rendered children rather than a wrapper div per React child, because
 * fragments have no DOM node — a page that passes its sections inside one fragment, or a component
 * that returns four cards from one, would otherwise collapse into a single flex item and lose every
 * gap between them. It also means a section that renders `null` leaves no element behind, so it
 * cannot hold an empty gap slot. The reveal stagger rides on the same children via CSS.
 */
export const ChartPageDiv: React.FC<ChartPageDivProps> = ({ children }) => {
  return <div className="flex w-full flex-col gap-6 md:gap-8">{children}</div>;
};

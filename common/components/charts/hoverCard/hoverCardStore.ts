import { create } from 'zustand';

import type { ResolvedHoverCardContent } from './types';

export interface HoverCard {
  content: ResolvedHoverCardContent;
  // Viewport coordinates of the hovered point
  x: number;
  y: number;
  // Beside the point for data, centered above it for annotation boxes
  placement: 'side' | 'above';
  // The chart showing the card, so tearing down a different chart leaves it alone
  owner: unknown;
}

/**
 * The open hover cards. Data and annotation hovers get separate slots because both can be active
 * over the same chart. Charts only write here, so hovering never re-renders the chart underneath.
 */
interface HoverCardState {
  point: HoverCard | null;
  annotation: HoverCard | null;
}

export const useHoverCardStore = create<HoverCardState>(() => ({ point: null, annotation: null }));

export const showHoverCard = (slot: keyof HoverCardState, card: HoverCard) =>
  useHoverCardStore.setState({ [slot]: card });

export const hideHoverCard = (slot: keyof HoverCardState, owner?: unknown) => {
  const current = useHoverCardStore.getState()[slot];
  if (!current || (owner !== undefined && current.owner !== owner)) return;
  useHoverCardStore.setState({ [slot]: null });
};

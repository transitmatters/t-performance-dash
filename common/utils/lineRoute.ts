import { notFound } from '@tanstack/react-router';
import type { LinePageKey } from '../constants/staticRoutes';
import { LINE_PAGE_LINES } from '../constants/staticRoutes';

/** 404 any line a page doesn't exist for (e.g. `/red/leaderboard/`), as the static export did. */
export const requireLine =
  (page: LinePageKey) =>
  ({ params }: { params: { line: string } }) => {
    if (!LINE_PAGE_LINES[page].includes(params.line)) throw notFound();
  };

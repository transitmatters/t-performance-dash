import { describeGap, getPartialCoverageGaps } from '../../utils/dataCoverage';
import { useLinePage, usePageDates } from '../../hooks/usePageParams';
import { Notice } from './Notice';

/** Explains the holes known coverage gaps leave in a range that only partly overlaps them. */
export const CoverageGapNotice = () => {
  const gaps = getPartialCoverageGaps(useLinePage().tab, usePageDates());
  if (!gaps.length) return null;

  return <Notice variant="warning">{gaps.map(describeGap).join(' ')}</Notice>;
};

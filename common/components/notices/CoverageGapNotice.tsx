import React from 'react';
import { describeGap, getPartialCoverageGaps } from '../../utils/dataCoverage';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';

/** Explains the holes known coverage gaps leave in a range that only partly overlaps them. */
export const CoverageGapNotice: React.FC = () => {
  const { tab, query } = useDelimitatedRoute();
  const gaps = getPartialCoverageGaps(tab, query);
  if (!gaps.length) return null;

  return <Notice variant="warning">{gaps.map(describeGap).join(' ')}</Notice>;
};

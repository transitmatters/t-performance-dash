import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { DataNotes } from './DataNotes';
import { BetaDataNotice } from './BetaDataNotice';
import { GobbleDataNotice } from './GobbleDataNotice';
import { BusDataNotice } from './BusDataNotice';

/**
 * Collapsed-by-default "About this data" section for provenance/context caveats
 * (how the data is collected, known coverage gaps). The urgent per-view accuracy
 * warnings — same-day and terminus — stay visible with the charts instead (see
 * TripExplorer). Only bus and Commuter Rail carry provenance notes today, so the
 * section is omitted entirely for other lines.
 */
export const TripDataNotes: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();
  const isBus = line === 'line-bus' || linePath === 'bus';
  const isCommuterRail = line === 'line-commuter-rail' || linePath === 'commuter-rail';

  if (!isBus && !isCommuterRail) {
    return null;
  }

  return (
    <DataNotes>
      <BetaDataNotice />
      <GobbleDataNotice />
      <BusDataNotice />
    </DataNotes>
  );
};

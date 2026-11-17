import { useMemo } from 'react';
import { useShutdownsForLines } from '../../common/api/hooks/shutdowns';
import { useMajorEventsStore } from '../../common/state/majorEventsStore';
import { useDelimitatedRoute } from '../../common/utils/router';
import {
  blocksToBandAnnotations,
  describeShutdowns,
  otherLineShutdownBlocks,
  otherShutdownLines,
} from './utils/shutdowns';

/**
 * Shuttles and suspensions on the rest of the subway over the given dates, as bands for this
 * line's charts. Nothing is fetched until the reader turns them on in the Display menu.
 */
export const useOtherLineShutdowns = (startDate?: string, endDate?: string) => {
  const show = useMajorEventsStore((state) => state.showOtherShutdowns);
  const { lineShort } = useDelimitatedRoute();
  const lines = useMemo(() => (show ? otherShutdownLines(lineShort) : []), [show, lineShort]);
  const data = useShutdownsForLines(lines, startDate, endDate, show);

  return useMemo(() => {
    const blocks = otherLineShutdownBlocks(
      lines.map((line, i) => ({ line, views: describeShutdowns(data[i] ?? [], line) }))
    );
    return { blocks, annotations: blocksToBandAnnotations(blocks) };
  }, [lines, data]);
};

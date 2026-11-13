import { useCallback } from 'react';
import type { RefObject } from 'react';
import type { Chart } from 'chart.js';
import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import { ChartActions } from '../../common/components/charts/ChartActions';
import type { SlowZonesEmbedLine } from './embed';
import { getSlowZonesEmbedSnippet, getSlowZonesEmbedTitle } from './embed';

interface TotalSlowTimeActionsProps {
  chartRef: RefObject<Chart | null>;
  line: SlowZonesEmbedLine;
  startDate: string;
  endDate: string;
}

/** The action row under the total slow time chart, with its embed snippet for this line. */
export const TotalSlowTimeActions = ({
  chartRef,
  line,
  startDate,
  endDate,
}: TotalSlowTimeActionsProps) => {
  const getEmbedSnippet = useCallback(
    () => getSlowZonesEmbedSnippet(line, { startDate, endDate }),
    [line, startDate, endDate]
  );
  return (
    <ChartActions
      datasetName="slowtime"
      chartRef={chartRef}
      chartTitle={getSlowZonesEmbedTitle(line)}
      startDate={startDate}
      endDate={endDate}
      embed={<EmbedButton getSnippet={getEmbedSnippet} />}
    />
  );
};

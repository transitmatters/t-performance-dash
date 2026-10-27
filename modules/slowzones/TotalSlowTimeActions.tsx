import { useCallback } from 'react';
import type { RefObject } from 'react';
import type { Chart } from 'chart.js';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { CopyButton } from '../../common/components/buttons/CopyLinkButton';
import { SaveChartImageButton } from '../../common/components/buttons/SaveChartImageButton';
import type { SlowZonesEmbedLine } from './embed';
import { getSlowZonesEmbedSnippet, getSlowZonesEmbedTitle } from './embed';

interface TotalSlowTimeActionsProps {
  chartRef: RefObject<Chart | null>;
  line: SlowZonesEmbedLine;
  startDate: string;
  endDate: string;
}

/** The PNG and embed buttons under the total slow time chart. */
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
    <div className="flex flex-row items-end justify-end gap-4">
      <SaveChartImageButton
        chartRef={chartRef}
        datasetName="slowtime"
        chartTitle={getSlowZonesEmbedTitle(line)}
        startDate={startDate}
        endDate={endDate}
      />
      <CopyButton
        getText={getEmbedSnippet}
        label="Embed"
        icon={faCode}
        ariaLabel="Copy embed code for this chart"
        failedMessage="Could not copy the embed code"
      />
    </div>
  );
};

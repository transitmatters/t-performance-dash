import React, { useCallback } from 'react';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { CopyButton } from '../../common/components/buttons/CopyLinkButton';
import type { SlowZonesEmbedLine } from './embed';
import { getSlowZonesEmbedSnippet } from './embed';

interface CopyEmbedButtonProps {
  line: SlowZonesEmbedLine;
  startDate?: string;
  endDate?: string;
}

/** Copies an <iframe> of the total slow time chart for the line and dates on screen. */
export const CopyEmbedButton: React.FC<CopyEmbedButtonProps> = ({ line, startDate, endDate }) => {
  const getText = useCallback(
    () => getSlowZonesEmbedSnippet(line, { startDate, endDate }),
    [line, startDate, endDate]
  );
  return (
    <CopyButton
      getText={getText}
      label="Embed"
      icon={faCode}
      ariaLabel="Copy embed code for this chart"
      failedMessage="Could not copy the embed code"
    />
  );
};

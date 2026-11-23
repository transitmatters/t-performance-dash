import { useSearch } from '@tanstack/react-router';
import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import { useLinePage } from '../../common/hooks/usePageParams';
import type { TripEmbed } from './embed';
import { getTripEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this trip chart, for the stops and dates on screen. */
export const TripEmbedButton = (embed: TripEmbed & { trendline?: boolean }) => {
  const { line, linePath } = useLinePage();
  const query = useSearch({ strict: false });
  return <EmbedButton getSnippet={() => getTripEmbedSnippet(embed, { line, linePath, query })} />;
};

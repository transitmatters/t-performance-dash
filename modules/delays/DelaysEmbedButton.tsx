import { useSearch } from '@tanstack/react-router';
import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import type { DelaysEmbedChart } from '../../common/constants/staticRoutes';
import { useLinePage } from '../../common/hooks/usePageParams';
import { getDelaysEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this Delays chart, for the route, dates and toggle on screen. */
export const DelaysEmbedButton = ({ chart }: { chart: DelaysEmbedChart }) => {
  const { line, linePath } = useLinePage();
  const query = useSearch({ strict: false });
  return <EmbedButton getSnippet={() => getDelaysEmbedSnippet(chart, { line, linePath, query })} />;
};

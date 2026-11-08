import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import type { DelaysEmbedChart } from '../../common/constants/staticRoutes';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getDelaysEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this Delays chart, for the route, dates and toggle on screen. */
export const DelaysEmbedButton = ({ chart }: { chart: DelaysEmbedChart }) => {
  const route = useDelimitatedRoute();
  return <EmbedButton getSnippet={() => getDelaysEmbedSnippet(chart, route)} />;
};

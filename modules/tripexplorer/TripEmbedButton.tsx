import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import type { TripEmbedChart } from '../../common/constants/staticRoutes';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getTripEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this single-day trip chart, for the stops and day on screen. */
export const TripEmbedButton = ({ chart }: { chart: TripEmbedChart }) => {
  const route = useDelimitatedRoute();
  return <EmbedButton getSnippet={() => getTripEmbedSnippet(chart, route)} />;
};

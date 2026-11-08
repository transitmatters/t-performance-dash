import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import type { ServiceEmbedChart } from '../../common/constants/staticRoutes';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getServiceEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this Service page chart, for the dates and toggle on screen. */
export const ServiceEmbedButton = ({ chart }: { chart: ServiceEmbedChart }) => {
  const { linePath, query } = useDelimitatedRoute();
  return <EmbedButton getSnippet={() => getServiceEmbedSnippet(linePath, chart, query)} />;
};

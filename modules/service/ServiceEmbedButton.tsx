import { useSearch } from '@tanstack/react-router';
import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import type { ServiceEmbedChart } from '../../common/constants/staticRoutes';
import { useLinePage } from '../../common/hooks/usePageParams';
import { getServiceEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this Service page chart, for the dates and toggle on screen. */
export const ServiceEmbedButton = ({ chart }: { chart: ServiceEmbedChart }) => {
  const { linePath } = useLinePage();
  const query = useSearch({ strict: false });
  return <EmbedButton getSnippet={() => getServiceEmbedSnippet(linePath, chart, query)} />;
};

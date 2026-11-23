import { createFileRoute, notFound } from '@tanstack/react-router';
import { isServiceEmbed } from '../../../../common/constants/staticRoutes';
import { hasKey } from '../../../../common/utils/hasKey';
import { linePathToKeyMap } from '../../../../common/utils/router';
import { validateServiceEmbedSearch } from '../../../../common/utils/searchSchemas';
import { ServiceChartEmbed } from '../../../../modules/service/ServiceChartEmbed';

function ServiceChartEmbedPage() {
  const { line, chart } = Route.useParams();
  // beforeLoad 404s any other line or chart
  if (!isServiceEmbed(line, chart) || !hasKey(linePathToKeyMap, line)) return null;
  return <ServiceChartEmbed line={line} chart={chart} />;
}

export const Route = createFileRoute('/embed/$line/service/$chart')({
  validateSearch: validateServiceEmbedSearch,
  beforeLoad: ({ params }) => {
    if (!isServiceEmbed(params.line, params.chart)) throw notFound();
  },
  staticData: { embed: true },
  component: ServiceChartEmbedPage,
});

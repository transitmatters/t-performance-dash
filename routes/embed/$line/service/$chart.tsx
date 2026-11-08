import { createFileRoute, notFound } from '@tanstack/react-router';
import { isServiceEmbed } from '../../../../common/constants/staticRoutes';
import type { ServiceEmbedChart } from '../../../../common/constants/staticRoutes';
import type { LinePath } from '../../../../common/types/lines';
import { validateServiceEmbedSearch } from '../../../../common/utils/searchSchemas';
import { ServiceChartEmbed } from '../../../../modules/service/ServiceChartEmbed';

function ServiceChartEmbedPage() {
  const { line, chart } = Route.useParams();
  return <ServiceChartEmbed line={line as LinePath} chart={chart as ServiceEmbedChart} />;
}

export const Route = createFileRoute('/embed/$line/service/$chart')({
  validateSearch: validateServiceEmbedSearch,
  beforeLoad: ({ params }) => {
    if (!isServiceEmbed(params.line, params.chart)) throw notFound();
  },
  staticData: { embed: true },
  component: ServiceChartEmbedPage,
});

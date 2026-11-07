import { createFileRoute, notFound } from '@tanstack/react-router';
import { isDelaysEmbed } from '../../../../common/constants/staticRoutes';
import type { DelaysEmbedChart } from '../../../../common/constants/staticRoutes';
import { validateDelaysEmbedSearch } from '../../../../common/utils/searchSchemas';
import { DelaysChartEmbed } from '../../../../modules/delays/DelaysChartEmbed';

function DelaysChartEmbedPage() {
  const { chart } = Route.useParams();
  return <DelaysChartEmbed chart={chart as DelaysEmbedChart} />;
}

export const Route = createFileRoute('/embed/$line/delays/$chart')({
  validateSearch: validateDelaysEmbedSearch,
  beforeLoad: ({ params }) => {
    if (!isDelaysEmbed(params.line, params.chart)) throw notFound();
  },
  staticData: { embed: true },
  component: DelaysChartEmbedPage,
});

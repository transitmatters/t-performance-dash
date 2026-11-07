import { createFileRoute, notFound } from '@tanstack/react-router';
import { isTripEmbed } from '../../../../../common/constants/staticRoutes';
import { validateMultiTripEmbedSearch } from '../../../../../common/utils/searchSchemas';
import { TripChartEmbed } from '../../../../../modules/tripexplorer/TripChartEmbed';

function MultiTripChartEmbedPage() {
  const { line, chart } = Route.useParams();
  if (!isTripEmbed('multi', line, chart)) return null;
  return <TripChartEmbed page="multi" chart={chart} />;
}

export const Route = createFileRoute('/embed/$line/trips/multi/$chart')({
  validateSearch: validateMultiTripEmbedSearch,
  beforeLoad: ({ params }) => {
    if (!isTripEmbed('multi', params.line, params.chart)) throw notFound();
  },
  staticData: { embed: true },
  component: MultiTripChartEmbedPage,
});

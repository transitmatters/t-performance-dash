import { createFileRoute, notFound } from '@tanstack/react-router';
import { isTripEmbed } from '../../../../../common/constants/staticRoutes';
import { TripChartEmbed } from '../../../../../modules/tripexplorer/TripChartEmbed';

function TripChartEmbedPage() {
  const { line, chart } = Route.useParams();
  if (!isTripEmbed(line, chart)) return null;
  return <TripChartEmbed chart={chart} />;
}

export const Route = createFileRoute('/embed/$line/trips/single/$chart')({
  beforeLoad: ({ params }) => {
    if (!isTripEmbed(params.line, params.chart)) throw notFound();
  },
  staticData: { embed: true },
  component: TripChartEmbedPage,
});

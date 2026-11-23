import { createFileRoute, notFound } from '@tanstack/react-router';
import { EMBED_SLOWZONES_LINES } from '../../../common/constants/staticRoutes';
import { validateEmbedSearch } from '../../../common/utils/searchSchemas';
import { SlowZonesEmbed } from '../../../modules/slowzones/SlowZonesEmbed';
import { isSlowZonesEmbedLine } from '../../../modules/slowzones/embed';

function SlowZonesEmbedPage() {
  const { line } = Route.useParams();
  // beforeLoad 404s any other line
  if (!isSlowZonesEmbedLine(line)) return null;
  return <SlowZonesEmbed line={line} />;
}

export const Route = createFileRoute('/embed/$line/slowzones')({
  validateSearch: validateEmbedSearch,
  beforeLoad: ({ params }) => {
    if (!EMBED_SLOWZONES_LINES.includes(params.line)) throw notFound();
  },
  staticData: { embed: true },
  component: SlowZonesEmbedPage,
});

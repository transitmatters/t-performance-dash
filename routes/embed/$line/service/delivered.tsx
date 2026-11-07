import { createFileRoute, notFound } from '@tanstack/react-router';
import { EMBED_SERVICE_LINES } from '../../../../common/constants/staticRoutes';
import type { LinePath } from '../../../../common/types/lines';
import { validateServiceEmbedSearch } from '../../../../common/utils/searchSchemas';
import { ServiceDeliveredEmbed } from '../../../../modules/service/ServiceDeliveredEmbed';

function ServiceDeliveredEmbedPage() {
  const { line } = Route.useParams();
  return <ServiceDeliveredEmbed line={line as LinePath} />;
}

export const Route = createFileRoute('/embed/$line/service/delivered')({
  validateSearch: validateServiceEmbedSearch,
  beforeLoad: ({ params }) => {
    if (!EMBED_SERVICE_LINES.includes(params.line)) throw notFound();
  },
  staticData: { embed: true },
  component: ServiceDeliveredEmbedPage,
});

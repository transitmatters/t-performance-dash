import React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { EMBED_SLOWZONES_LINES } from '../../../common/constants/staticRoutes';
import { SlowZonesEmbed } from '../../../modules/slowzones/SlowZonesEmbed';
import type { SlowZonesEmbedLine } from '../../../modules/slowzones/embed';

function SlowZonesEmbedPage() {
  const { line } = Route.useParams();
  return <SlowZonesEmbed line={line as SlowZonesEmbedLine} />;
}

export const Route = createFileRoute('/embed/$line/slowzones')({
  beforeLoad: ({ params }) => {
    if (!EMBED_SLOWZONES_LINES.includes(params.line)) throw notFound();
  },
  staticData: { embed: true },
  component: SlowZonesEmbedPage,
});

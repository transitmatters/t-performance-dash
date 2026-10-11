import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../../../common/layouts/layoutTypes';
import { requireLine } from '../../../../common/utils/lineRoute';
import { TripExplorer } from '../../../../modules/tripexplorer/TripExplorer';

export const Route = createFileRoute('/$line/trips/multi/')({
  beforeLoad: requireLine('trips/multi'),
  staticData: { layout: Layout.Dashboard },
  component: TripExplorer,
});

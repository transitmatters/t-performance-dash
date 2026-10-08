import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../../../common/layouts/layoutTypes';
import { requireLine } from '../../../../common/utils/lineRoute';
import { TripExplorer } from '../../../../modules/tripexplorer/TripExplorer';

export const Route = createFileRoute('/$line/trips/single/')({
  beforeLoad: requireLine('trips/single'),
  staticData: { layout: Layout.Dashboard },
  component: TripExplorer,
});

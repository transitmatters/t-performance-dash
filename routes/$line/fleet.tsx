import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { FleetDetails } from '../../modules/fleet/FleetDetails';

export const Route = createFileRoute('/$line/fleet')({
  beforeLoad: requireLine('fleet'),
  staticData: { layout: Layout.Dashboard },
  component: FleetDetails,
});

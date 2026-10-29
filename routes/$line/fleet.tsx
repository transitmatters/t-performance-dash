import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateFleetSearch } from '../../common/utils/searchSchemas';
import { FleetDetails } from '../../modules/fleet/FleetDetails';

export const Route = createFileRoute('/$line/fleet')({
  validateSearch: validateFleetSearch,
  beforeLoad: requireLine('fleet'),
  staticData: { layout: Layout.Dashboard },
  component: FleetDetails,
});

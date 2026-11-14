import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateBusSpeedSearch } from '../../common/utils/searchSchemas';
import { BusSpeedMapDetails } from '../../modules/busspeedmap/BusSpeedMapDetails';

export const Route = createFileRoute('/$line/speedmap')({
  validateSearch: validateBusSpeedSearch,
  beforeLoad: requireLine('speedmap'),
  staticData: { layout: Layout.Dashboard },
  component: BusSpeedMapDetails,
});

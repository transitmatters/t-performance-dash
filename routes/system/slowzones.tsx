import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { validateSystemSearch } from '../../common/utils/searchSchemas';
import { SystemSlowZonesDetails } from '../../modules/slowzones/SystemSlowZonesDetails';

export const Route = createFileRoute('/system/slowzones')({
  validateSearch: validateSystemSearch,
  staticData: { layout: Layout.Dashboard },
  component: SystemSlowZonesDetails,
});

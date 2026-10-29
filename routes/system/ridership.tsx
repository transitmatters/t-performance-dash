import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { validateSystemSearch } from '../../common/utils/searchSchemas';
import { ServiceAndRidershipDash } from '../../modules/serviceAndRidership';

export const Route = createFileRoute('/system/ridership')({
  validateSearch: validateSystemSearch,
  staticData: { layout: Layout.Dashboard },
  component: ServiceAndRidershipDash,
});

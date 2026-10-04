import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { ServiceAndRidershipDash } from '../../modules/serviceAndRidership';

export const Route = createFileRoute('/system/ridership')({
  staticData: { layout: Layout.Dashboard },
  component: ServiceAndRidershipDash,
});

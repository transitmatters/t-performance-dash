import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { SystemSlowZonesDetails } from '../../modules/slowzones/SystemSlowZonesDetails';

export const Route = createFileRoute('/system/slowzones')({
  staticData: { layout: Layout.Dashboard },
  component: SystemSlowZonesDetails,
});

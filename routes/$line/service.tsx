import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { ServiceDetails } from '../../modules/service/ServiceDetails';

export const Route = createFileRoute('/$line/service')({
  beforeLoad: requireLine('service'),
  staticData: { layout: Layout.Dashboard },
  component: ServiceDetails,
});

import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { ServicePage } from '../../modules/service/ServicePage';

export const Route = createFileRoute('/$line/service')({
  beforeLoad: requireLine('service'),
  staticData: { layout: Layout.Dashboard },
  component: ServicePage,
});

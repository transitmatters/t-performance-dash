import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateServiceSearch } from '../../common/utils/searchSchemas';
import { ServicePage } from '../../modules/service/ServicePage';

export const Route = createFileRoute('/$line/service')({
  validateSearch: validateServiceSearch,
  beforeLoad: requireLine('service'),
  staticData: { layout: Layout.Dashboard },
  component: ServicePage,
});

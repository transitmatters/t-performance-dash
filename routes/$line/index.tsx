import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { redirectV3Route } from '../../common/utils/middleware';
import { validateOverviewSearch } from '../../common/utils/searchSchemas';
import { Overview } from '../../modules/dashboard/Overview';

export const Route = createFileRoute('/$line/')({
  validateSearch: validateOverviewSearch,
  beforeLoad: (context) => {
    requireLine('')(context);
    redirectV3Route(context);
  },
  staticData: { layout: Layout.Dashboard },
  component: Overview,
});

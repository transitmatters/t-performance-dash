import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateLineSearch } from '../../common/utils/searchSchemas';
import { DelaysDetails } from '../../modules/delays/DelaysDetails';

export const Route = createFileRoute('/$line/delays')({
  validateSearch: validateLineSearch,
  beforeLoad: requireLine('delays'),
  staticData: { layout: Layout.Dashboard },
  component: DelaysDetails,
});

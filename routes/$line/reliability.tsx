import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateLineSearch } from '../../common/utils/searchSchemas';
import { ReliabilityDetails } from '../../modules/reliability/ReliabilityDetails';

export const Route = createFileRoute('/$line/reliability')({
  validateSearch: validateLineSearch,
  beforeLoad: requireLine('reliability'),
  staticData: { layout: Layout.Dashboard },
  component: ReliabilityDetails,
});

import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateLineSearch } from '../../common/utils/searchSchemas';
import { RidershipDetails } from '../../modules/ridership/RidershipDetails';

export const Route = createFileRoute('/$line/ridership')({
  validateSearch: validateLineSearch,
  beforeLoad: requireLine('ridership'),
  staticData: { layout: Layout.Dashboard },
  component: RidershipDetails,
});

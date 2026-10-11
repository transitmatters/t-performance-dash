import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { RidershipDetails } from '../../modules/ridership/RidershipDetails';

export const Route = createFileRoute('/$line/ridership')({
  beforeLoad: requireLine('ridership'),
  staticData: { layout: Layout.Dashboard },
  component: RidershipDetails,
});

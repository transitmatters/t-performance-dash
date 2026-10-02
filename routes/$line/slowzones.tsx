import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { SlowZonesDetails } from '../../modules/slowzones/SlowZonesDetails';

export const Route = createFileRoute('/$line/slowzones')({
  beforeLoad: requireLine('slowzones'),
  staticData: { layout: Layout.Dashboard },
  component: SlowZonesDetails,
});

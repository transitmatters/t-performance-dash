import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { DelaysDetails } from '../../modules/delays/DelaysDetails';

export const Route = createFileRoute('/$line/delays')({
  beforeLoad: requireLine('delays'),
  staticData: { layout: Layout.Dashboard },
  component: DelaysDetails,
});

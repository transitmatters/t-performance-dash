import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { PredictionsDetails } from '../../modules/predictions/PredictionsDetails';

export const Route = createFileRoute('/$line/predictions')({
  beforeLoad: requireLine('predictions'),
  staticData: { layout: Layout.Dashboard },
  component: PredictionsDetails,
});

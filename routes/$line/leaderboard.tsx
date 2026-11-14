import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { validateBusSpeedSearch } from '../../common/utils/searchSchemas';
import { BusSpeedLeaderboardDetails } from '../../modules/busspeedmap/leaderboard/BusSpeedLeaderboardDetails';

export const Route = createFileRoute('/$line/leaderboard')({
  validateSearch: validateBusSpeedSearch,
  beforeLoad: requireLine('leaderboard'),
  staticData: { layout: Layout.Dashboard },
  component: BusSpeedLeaderboardDetails,
});

import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { Home } from '../../modules/home/Home';
import { prefetchHomeData } from '../../modules/home/queries';

export const Route = createFileRoute('/system/')({
  staticData: { layout: Layout.Landing },
  loader: () => {
    void prefetchHomeData();
  },
  component: Home,
});

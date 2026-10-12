import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../common/layouts/layoutTypes';
import { Home } from '../modules/home/Home';
import { prefetchHomeData } from '../modules/home/queries';

export const Route = createFileRoute('/')({
  staticData: { layout: Layout.Landing },
  // Not awaited: the page renders its shell straight away and fills in as the data lands.
  loader: () => {
    void prefetchHomeData();
  },
  component: Home,
});

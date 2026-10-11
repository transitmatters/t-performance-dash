import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../common/layouts/layoutTypes';
import { Home } from '../modules/home/Home';

export const Route = createFileRoute('/')({
  staticData: { layout: Layout.Landing },
  component: Home,
});

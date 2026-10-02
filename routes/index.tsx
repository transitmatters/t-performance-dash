import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../common/layouts/layoutTypes';
import { Landing } from '../modules/landing/Landing';

export const Route = createFileRoute('/')({
  staticData: { layout: Layout.Landing },
  component: Landing,
});

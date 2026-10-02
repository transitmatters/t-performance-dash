import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { Landing } from '../../modules/landing/Landing';

export const Route = createFileRoute('/system/')({
  staticData: { layout: Layout.Landing },
  component: Landing,
});

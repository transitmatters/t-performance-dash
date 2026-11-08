import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../common/layouts/layoutTypes';
import { Methodology } from '../modules/methodology/Methodology';

export const Route = createFileRoute('/methodology')({
  staticData: { layout: Layout.Landing },
  component: Methodology,
});

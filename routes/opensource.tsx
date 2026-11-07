import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../common/layouts/layoutTypes';
import { OpenSource } from '../modules/opensource/OpenSource';

export const Route = createFileRoute('/opensource')({
  staticData: { layout: Layout.Landing },
  component: OpenSource,
});

import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Layout } from '../common/layouts/layoutTypes';
import { redirectV3Route } from '../common/utils/middleware';
import { LoadingSpinner } from '../common/components/graphics/LoadingSpinner';

/** Simple re-routing page for v3 urls */
function RapidTransit() {
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export const Route = createFileRoute('/rapidtransit')({
  beforeLoad: redirectV3Route,
  staticData: { layout: Layout.Landing },
  component: RapidTransit,
});

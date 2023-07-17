import React from 'react';

import { Layout } from '../common/layouts/layoutTypes';
import { useRewriteV3Route } from '../common/utils/middleware';
import { LoadingSpinner } from '../common/components/graphics/LoadingSpinner';

/** Simple re-routing page for v3 urls */
export default function RapidTransit() {
  useRewriteV3Route();

  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

RapidTransit.Layout = Layout.Landing;

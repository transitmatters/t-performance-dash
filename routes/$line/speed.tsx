import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { requireLine } from '../../common/utils/lineRoute';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BusSpeedDetails } from '../../modules/speed/BusSpeedDetails';
import { SpeedDetails } from '../../modules/speed/SpeedDetails';

function SpeedPage() {
  const { line } = useDelimitatedRoute();
  // Bus has no line/branch concept and a different (daily-only) data source, so it gets
  // its own route-picking data-fetch path rather than sharing rail's line fan-out.
  return line === 'line-bus' ? <BusSpeedDetails /> : <SpeedDetails />;
}

export const Route = createFileRoute('/$line/speed')({
  beforeLoad: requireLine('speed'),
  staticData: { layout: Layout.Dashboard },
  component: SpeedPage,
});

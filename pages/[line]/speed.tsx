import React from 'react';
import { ALL_LINE_PATHS, BUS_PATH } from '../../common/types/lines';
import { Layout } from '../../common/layouts/layoutTypes';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BusSpeedDetails } from '../../modules/speed/BusSpeedDetails';
import { SpeedDetails } from '../../modules/speed/SpeedDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, BUS_PATH],
    fallback: false,
  };
}

function SpeedPage() {
  const { line } = useDelimitatedRoute();
  // Bus has no line/branch concept and a different (daily-only) data source, so it gets
  // its own route-picking data-fetch path rather than sharing rail's line fan-out.
  return line === 'line-bus' ? <BusSpeedDetails /> : <SpeedDetails />;
}

SpeedPage.Layout = Layout.Dashboard;

export default SpeedPage;

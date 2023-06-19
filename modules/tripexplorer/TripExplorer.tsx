import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getParentStationForStopId } from '../../common/utils/stations';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { SameDayNotice } from '../../common/components/notices/SameDayNotice';
import { TripGraphs } from './TripGraphs';

export const TripExplorer = () => {
  const {
    query: { to, from },
  } = useDelimitatedRoute();

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;

  if (!(fromStation && toStation)) {
    return null;
  }
  return (
    <PageWrapper pageTitle={'Trips'}>
      <div className="flex flex-col gap-4">
        <TripGraphs fromStation={fromStation} toStation={toStation} />
        <SameDayNotice />
        <TerminusNotice toStation={toStation} fromStation={fromStation} />
      </div>
    </PageWrapper>
  );
};
TripExplorer.Layout = Layout.Dashboard;

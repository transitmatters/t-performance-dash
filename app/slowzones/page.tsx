'use client';

import React, { use } from 'react';

async function getData() {
  // this will error out
  const res = await fetch(
    'http://localhost:5000/traveltimes/2022-10-10?from_stop=70059&to_stop=70045'
  );
  return res.json();
}

export default async function SlowZones() {
  const delayTotals = use(getData());
  return <>{JSON.stringify(delayTotals)}</>;
}

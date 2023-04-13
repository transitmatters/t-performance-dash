'use client';
import React from 'react';
import { useConvertConfigParam, useHandlePageRedirect } from '../common/utils/router';
import { ALL_PAGES } from '../common/constants/pages';
import { LoadingSpinner } from '../common/components/graphics/LoadingSpinner';

// v3 route conversion
export default function RapidTransit() {
  const newConfig = useConvertConfigParam();
  const redirectPage = useHandlePageRedirect();

  if (newConfig && newConfig.line) {
    redirectPage(ALL_PAGES.trips, newConfig.line, newConfig.queryParams);
  }

  return (
    <>
      Redirecting to new trips page <LoadingSpinner />
    </>
  );
}

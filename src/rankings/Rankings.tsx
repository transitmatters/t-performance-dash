import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export const Rankings: React.FC = () => {
  document.title = 'Data Dashboard - Rankings';
  const params = useQuery();
  const history = useHistory();

  return (
    <>
      <h1>Headways</h1>
    </>
  );
};

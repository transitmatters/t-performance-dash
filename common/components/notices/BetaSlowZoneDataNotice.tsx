import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';

export const BetaSlowZoneDataNotice: React.FC = () => {
  const { line } = useDelimitatedRoute();

  if (line !== 'line-green') {
    return null;
  }

  return (
    <Notice variant="warning" title="Green Line slow zones are in beta">
      <p>
        Due to the variable nature of service on the Green Line, we can't detect slow zones as
        easily as with heavy rail lines. Additionally, we only monitor the D branch as it is the
        only <a href="https://en.wikipedia.org/wiki/Grade_separation">grade-separated</a> branch.
      </p>
    </Notice>
  );
};

import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';

export const CrBetaAccuracyNotice: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();

  if (line !== 'line-commuter-rail' && linePath !== 'commuter-rail') {
    return null;
  }

  return (
    <Notice variant="warning">
      Commuter Rail data is in beta — headways and travel times may be incomplete or inaccurate.
    </Notice>
  );
};

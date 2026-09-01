import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';

/**
 * Bus coverage note. Renders as plain prose for the "About this data"
 * accordion (see TripDataNotes).
 */
export const BusDataNotice: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();

  if (line !== 'line-bus' && linePath !== 'bus') {
    return null;
  }

  return (
    <p>
      Bus data isn&apos;t guaranteed to be complete for any stop or date, which may affect headway
      figures in particular.
    </p>
  );
};

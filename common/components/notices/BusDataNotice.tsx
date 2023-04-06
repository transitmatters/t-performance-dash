import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';

export const BusDataNotice: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();

  if (line === 'line-bus' || linePath === 'bus') {
    return (
      <div className={'m-3 text-sm italic'}>
        <p>
          Due to data collection issues, bus data is not guaranteed to be complete for any stop or
          date.
        </p>
        <p>This may lead to inaccuracies, particularly in headway calculations.</p>
      </div>
    );
  }
  return null;
};

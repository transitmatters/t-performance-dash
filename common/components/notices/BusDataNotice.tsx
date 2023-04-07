import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../utils/router';

export const BusDataNotice: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();

  if (line === 'BUS' || linePath === 'bus') {
    return (
      <div className={'flex items-center'}>
        <FontAwesomeIcon icon={faMagnifyingGlassChart} size={'2x'} />
        <div className={'m-3 text-sm italic'}>
          <p>
            Due to data collection issues, bus data is not guaranteed to be complete for any stop or
            date.
          </p>
          <p>This may lead to inaccuracies, particularly in headway calculations.</p>
        </div>
      </div>
    );
  }
  return null;
};

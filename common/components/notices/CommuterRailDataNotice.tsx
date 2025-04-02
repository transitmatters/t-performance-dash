import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../utils/router';

export const CommuterRailDataNotice: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();

  if (line === 'line-commuter-rail' || linePath === 'commuter-rail') {
    return (
      <div className={'flex items-center'}>
        <FontAwesomeIcon icon={faLocationCrosshairs} size={'lg'} />
        <div className={'mx-3 my-2 text-sm italic'}>
          <p>
            Due to how we collect data for Commuter Rail, we may occasionally miss trips or stops.
            This can lead to inaccuracies in headways numbers and gaps in travel time data. Confirm
            data you see here with official MBTA sources when possible.
          </p>
        </div>
      </div>
    );
  }
  return null;
};

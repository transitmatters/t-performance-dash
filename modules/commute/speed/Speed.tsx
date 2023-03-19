import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSpeed } from '../../../common/api/speed';
import { useDelimitatedRoute } from '../../../common/utils/router';
import classNames from 'classnames';
import { lineColorBackground } from '../../../common/styles/general';

export const Speed = () => {
  const { line } = useDelimitatedRoute();
  const speed = useQuery(['speed', line], () => fetchSpeed(line));
  if (speed.isError) {
    return <p>Error</p>;
  }

  const speedData = speed.data || [];
  return (
    <div
      className={classNames(
        'w-full items-center justify-center rounded-lg p-4 text-center xl:w-1/2',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <p className="text-white">Speed</p>
      <p className="text-3xl font-semibold text-white">{speedData[0]?.value ?? ''}%</p>
    </div>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLineTraversalTimes } from '../../../common/api/speed';
import { useDelimitatedRoute } from '../../../common/utils/router';
import classNames from 'classnames';
import { lineColorBackground } from '../../../common/styles/general';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../../common/constants/dates';
import { MINIMUMS } from '../../speed/constants/delays';

export const Speed: React.FC = () => {
  const { line } = useDelimitatedRoute();
  const today = dayjs().format(DATE_FORMAT);
  const speed = useQuery(['speed', line], () =>
    fetchLineTraversalTimes({ start_date: today, end_date: today, agg: 'daily', line: line })
  );
  if (speed.isError) {
    return <p>Error</p>;
  }

  const speedData = speed.data || [];
  return (
    <div
      className={classNames(
        'items-center justify-center rounded-lg p-4 text-center',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <p className="text-white">Speed</p>
      <p className="text-3xl font-semibold text-white">
        {Math.round((100 * MINIMUMS[line ?? 'DEFAULT']) / speedData[0]?.value) ?? ''}%
      </p>
    </div>
  );
};

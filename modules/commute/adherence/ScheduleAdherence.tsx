import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchScheduleAdherence } from '../../../common/api/speed';
import { useDelimitatedRoute } from '../../../common/utils/router';
import classNames from 'classnames';
import { lineColorBackground } from '../../../common/styles/general';

export const ScheduleAdherence: React.FC = () => {
  const { line } = useDelimitatedRoute();
  const scheduleAdherence = useQuery(['scheduleAdherence', line], () =>
    fetchScheduleAdherence(line)
  );
  if (scheduleAdherence.isError) {
    return <p>Error</p>;
  }

  const scheduleAdherenceData = scheduleAdherence.data || [];
  return (
    <div
      className={classNames(
        'items-center justify-center rounded-lg p-4 text-center',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <p className="text-white">Schedule Adherence</p>
      <p className="text-3xl font-semibold text-white">{scheduleAdherenceData[0]?.value ?? ''}%</p>
    </div>
  );
};

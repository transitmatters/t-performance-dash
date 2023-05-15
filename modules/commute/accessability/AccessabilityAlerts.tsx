import React from 'react';
import classNames from 'classnames';
import { useElevatorsAndEscalators } from '../../../common/api/hooks/facilities';
import { useDelimitatedRoute } from '../../../common/utils/router';

export const AccessabilityAlerts: React.FC = () => {
  const { lineShort } = useDelimitatedRoute();

  const facilities = useElevatorsAndEscalators(lineShort);

  const divStyle = classNames(
    'flex flex-col rounded-md py-4 text-white shadow-dataBox w-full xl:w-1/3 gap-y-2 md:max-h-[309px] md:overflow-y-auto'
    // lineColorBackground[line ?? 'DEFAULT']
  );

  return (
    <div className={divStyle}>
      <h3 className="w-full px-4 text-2xl font-semibold md:w-auto">Accessability</h3>
    </div>
  );
};

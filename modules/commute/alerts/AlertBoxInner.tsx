import React, { useState } from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import { AlertModal } from './AlertModal';
import { CurrentTime, UpcomingTime } from './Time';

interface AlertBoxInnerProps {
  header: string;
  Icon: React.ElementType;
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  children: React.ReactNode;
}

export const AlertBoxInner: React.FC<AlertBoxInnerProps> = ({
  header,
  Icon,
  alert,
  type,
  children,
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div
      onClick={() => {
        setShowModal(!showModal);
      }}
      className="flex cursor-pointer flex-col gap-y-2 whitespace-nowrap rounded-md border-2 border-white border-opacity-10 bg-white bg-opacity-5 py-1 pl-1 pr-4 shadow-sm hover:bg-opacity-0 md:w-full md:whitespace-normal"
    >
      {showModal && (
        <AlertModal
          showModal={showModal}
          setShowModal={setShowModal}
          header={header}
          Icon={Icon}
          type={alert.type}
        />
      )}
      {/* doubled divs here. */}
      <div className="flex w-full flex-row items-center">
        <Icon className="ml-2 mr-4 h-10 w-10" aria-hidden="true" />
        <div className="flex w-full flex-col items-center justify-center text-stone-100">
          <div className="flex w-full flex-row items-center pr-2 text-center text-lg md:flex-wrap">
            {children}
          </div>

          <div className="flex w-full flex-row items-center  gap-x-1 text-center text-stone-200 md:flex-wrap">
            {type === 'current' ? (
              <CurrentTime times={alert.relevantTimes} />
            ) : (
              <UpcomingTime times={alert.relevantTimes} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

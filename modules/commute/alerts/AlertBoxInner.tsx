import React, { useState } from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { Line } from '../../../common/types/lines';
import { AlertModal } from './AlertModal';
import { CurrentTime, UpcomingTime } from './Time';

interface AlertBoxInnerProps {
  header: string;
  Icon: React.ElementType;
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  children: React.ReactNode;
  line?: Line;
}

export const AlertBoxInner: React.FC<AlertBoxInnerProps> = ({
  header,
  Icon,
  alert,
  type,
  children,
  line,
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div
      onClick={() => {
        setShowModal(!showModal);
      }}
      className="flex cursor-pointer flex-col gap-y-2 whitespace-nowrap rounded-md border border-black border-opacity-20 bg-black bg-opacity-[15%] py-1 pl-1 pr-4 shadow-sm hover:bg-opacity-10 md:w-full md:whitespace-normal"
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

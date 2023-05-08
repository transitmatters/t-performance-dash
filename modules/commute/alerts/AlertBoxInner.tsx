import React, { useState } from 'react';
import classNames from 'classnames';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { AlertModal } from './AlertModal';
import { CurrentTime, UpcomingTime } from './Time';

interface AlertBoxInnerProps {
  header: string;
  Icon: React.ElementType;
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  children: React.ReactNode;
  noShrink?: boolean;
}

export const AlertBoxInner: React.FC<AlertBoxInnerProps> = ({
  header,
  Icon,
  alert,
  type,
  noShrink,
  children,
}) => {
  const [showModal, setShowModal] = useState(false);
  const isMobile = !useBreakpoint('md');
  const _noShrink = noShrink || !isMobile;
  return (
    <div
      onClick={() => {
        setShowModal(!showModal);
      }}
      className={classNames(
        'flex cursor-pointer flex-col gap-y-2 rounded-md border border-black border-opacity-20 bg-black bg-opacity-[15%] py-1 pl-1 pr-4 shadow-sm hover:bg-opacity-10',
        _noShrink ? 'w-full whitespace-normal' : 'whitespace-nowrap'
      )}
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
          <div
            className={classNames(
              'flex w-full flex-row items-center pr-2 text-center text-lg ',
              _noShrink && 'flex-wrap'
            )}
          >
            {children}
          </div>

          <div
            className={classNames(
              'flex w-full flex-row items-center  gap-x-1 text-center text-stone-200',
              _noShrink && 'flex-wrap'
            )}
          >
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

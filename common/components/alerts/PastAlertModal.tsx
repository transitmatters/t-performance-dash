import React, { Fragment } from 'react';
import type { SetStateAction } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { useAlertStore } from '../../../modules/tripexplorer/AlertStore';
import { getDateString } from '../../../modules/commute/alerts/AlertUtils';

interface PastAlertModalProps {
  alertsOpen: boolean;
  setAlertsOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const PastAlertModal: React.FC<PastAlertModalProps> = ({ alertsOpen, setAlertsOpen }) => {
  const alertStore = useAlertStore();
  return (
    <Transition.Root show={alertsOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setAlertsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="flex flex-col items-center gap-2">
                  <p style={{ fontFamily: 'Helvetica Neue' }} className="text-5xl text-yellow-300 ">
                    ⚠️
                  </p>

                  <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto md:max-h-[66vh]">
                    {alertStore.alerts?.map((alert, index) => (
                      <div
                        key={index}
                        className={classNames(
                          alert.applied ? 'bg-yellow-200' : 'bg-yellow-100 ',
                          'flex cursor-pointer flex-col rounded-md border border-yellow-200 bg-yellow-100 p-2 shadow-sm hover:bg-yellow-200 '
                        )}
                        onClick={() => {
                          alertStore.changeAlertApplied(alertStore.alerts, index);
                        }}
                      >
                        <p className="font-bold">
                          {getDateString(alert.valid_from, alert.valid_to)}
                        </p>
                        <p className="text-sm">{alert.text}</p>
                        <p className="w-full pt-2 text-center text-sm italic">
                          {alert.applied ? 'Remove' : 'Add to chart'}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="hidden w-full rounded-md border border-stone-200 py-1 hover:bg-stone-200 lg:block"
                    onClick={() => setAlertsOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

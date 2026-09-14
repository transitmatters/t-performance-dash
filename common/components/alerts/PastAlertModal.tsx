import React from 'react';
import type { SetStateAction } from 'react';
import classNames from 'classnames';
import { useAlertStore } from '../../../modules/tripexplorer/AlertStore';
import { getDateString } from '../../../modules/commute/alerts/AlertUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface PastAlertModalProps {
  alertsOpen: boolean;
  setAlertsOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const PastAlertModal: React.FC<PastAlertModalProps> = ({ alertsOpen, setAlertsOpen }) => {
  const alertStore = useAlertStore();
  return (
    <Dialog open={alertsOpen} onOpenChange={setAlertsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center">
          <p className="text-5xl">⚠️</p>
          <DialogTitle className="text-lg font-normal">Alerts</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto md:max-h-[66vh]">
          {alertStore.alerts?.map((alert, index) => (
            <div
              key={index}
              className={classNames(
                alert.applied ? 'bg-yellow-200' : 'bg-yellow-100',
                'flex cursor-pointer flex-col rounded-md border border-yellow-200 p-2 shadow-xs hover:bg-yellow-200'
              )}
              onClick={() => {
                alertStore.changeAlertApplied(alertStore.alerts, index);
              }}
            >
              <p className="font-bold">{getDateString(alert.valid_from, alert.valid_to)}</p>
              <p className="text-sm">{alert.text}</p>
              <p className="w-full pt-2 text-center text-sm italic">
                {alert.applied ? 'Remove' : 'Add to chart'}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

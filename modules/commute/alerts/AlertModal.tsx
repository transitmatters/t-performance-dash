import type { SetStateAction } from 'react';
import React from 'react';
import classNames from 'classnames';
import { AlertNames } from '../../../common/types/alerts';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { lineColorBackground, lineColorVar } from '../../../common/styles/general';
import { Button } from '../../../common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../common/components/ui/dialog';

interface AlertModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
  header: string;
  description?: string;
  Icon: React.ElementType;
  type: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  showModal,
  setShowModal,
  header,
  description,
  Icon,
  type,
}) => {
  const { line } = useDelimitatedRoute();
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center">
          <div
            className={classNames(
              'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
              lineColorBackground[line ?? 'DEFAULT']
            )}
          >
            <Icon className="h-10 w-10" aria-hidden="true" />
          </div>
          <DialogTitle className="mt-3 text-base font-semibold text-gray-900">
            {AlertNames[type]}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">{header}</DialogDescription>
        </DialogHeader>
        {description && <p className="text-center text-xs text-gray-500">{description}</p>}
        <DialogFooter>
          <Button
            type="button"
            style={lineColorVar(line)}
            className="w-full bg-(--line-color) text-white hover:bg-(--line-color)/90"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

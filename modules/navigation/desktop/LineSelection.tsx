import { useRouter } from 'next/router';
import React from 'react';
import classNames from 'classnames';
import { lineColorBackground, lineColorDarkBorder } from '../../../common/styles/general';
import { BusSelection } from './BusSelection';

export const LineSelection = ({ lineItems }) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-1">
      {lineItems.map((lineItem) => (
        <div
          key={lineItem.key}
          onClick={() => {
            router.push(`${lineItem.path}`);
          }}
          className={classNames(
            'flex w-full justify-center rounded-md border bg-opacity-10 py-1 text-white hover:bg-opacity-80',
            lineColorBackground[lineItem.key ?? 'DEFAULT'],
            lineColorDarkBorder[lineItem.key ?? 'DEFAULT']
          )}
        >
          <p>{lineItem.name}</p>
        </div>
      ))}
      <div className="col-span-2 w-full">
        <BusSelection />
      </div>
    </div>
  );
};

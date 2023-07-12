import React from 'react';
import { faBus, faTrainSubway, faTrainTram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { LineButton } from './LineButton';

export const LineSelectionLanding: React.FC = () => {
  return (
    <div className="flex w-full flex-col items-start px-4 pt-20 text-stone-900 md:items-center md:pt-32">
      <h2 className="text-5xl font-thin xl:text-7xl">Ready to learn more?</h2>
      <h3 className="text-lg font-thin">Select a subway line or bus route to get started.</h3>
      <div className="flex w-full flex-col gap-y-8 pt-12 md:flex-row md:justify-around">
        <LineButton line="line-red">
          <FontAwesomeIcon
            icon={faTrainSubway}
            className={classNames('h-16 w-16 lg:h-20 lg:w-20', 'text-white')}
          />
        </LineButton>
        <LineButton line="line-orange">
          <FontAwesomeIcon
            icon={faTrainSubway}
            className={classNames('h-16 w-16 lg:h-20 lg:w-20', 'text-white')}
          />
        </LineButton>
        <LineButton line="line-blue">
          <FontAwesomeIcon
            icon={faTrainSubway}
            className={classNames('h-16 w-16 lg:h-20 lg:w-20', 'text-white')}
          />
        </LineButton>
        <LineButton line="line-green">
          <FontAwesomeIcon
            icon={faTrainTram}
            className={classNames('h-16 w-16 lg:h-20 lg:w-20', 'text-white')}
          />
        </LineButton>
        <LineButton line="line-bus">
          <FontAwesomeIcon
            icon={faBus}
            className={classNames('h-16 w-16 lg:h-20 lg:w-20', 'text-white')}
          />
        </LineButton>
      </div>
    </div>
  );
};

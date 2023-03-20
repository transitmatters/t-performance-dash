import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'flowbite-react';

interface InfoTooltipProps {
  info: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ info }) => {
  const textComponent = <p className="max-w-xs">{info}</p>;
  return (
    <Tooltip content={textComponent}>
      <FontAwesomeIcon
        icon={faCircleInfo}
        size={'sm'}
        className={'m-0 mr-1 h-6 w-6 rounded-sm text-white'}
      />
    </Tooltip>
  );
};

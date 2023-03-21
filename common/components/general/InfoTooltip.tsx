import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'flowbite-react';

interface InfoTooltipProps {
  info: string;
  size?: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ info, size = 6 }) => {
  const textComponent = <p className="max-w-xs">{info}</p>;
  return (
    <Tooltip content={textComponent}>
      <FontAwesomeIcon
        icon={faCircleInfo}
        size={'sm'}
        className={`h-${size} w-${size} rounded-sm text-white`}
      />
    </Tooltip>
  );
};

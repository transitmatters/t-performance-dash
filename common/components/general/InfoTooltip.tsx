import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/common/components/ui/tooltip';

interface InfoTooltipProps {
  info: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ info, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={info} className={className}>
          <FontAwesomeIcon icon={faCircleInfo} size="sm" className="rounded-sm" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{info}</TooltipContent>
    </Tooltip>
  );
};

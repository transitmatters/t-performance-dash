import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/common/components/ui/tooltip';

interface InfoTooltipProps {
  info: string;
  className?: string;
}

export const InfoTooltip = ({ info, className }: InfoTooltipProps) => {
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

/** A card title with an info pill beside it. */
export const TitleWithInfo = ({ title, info }: { title: string; info: string }) => (
  <span className="inline-flex items-center gap-2">
    {title}
    <InfoTooltip info={info} className="leading-none text-muted-foreground" />
  </span>
);

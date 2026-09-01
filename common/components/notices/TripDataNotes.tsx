import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../utils/router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { BetaDataNotice } from './BetaDataNotice';
import { GobbleDataNotice } from './GobbleDataNotice';
import { BusDataNotice } from './BusDataNotice';

/**
 * Collapsed-by-default "About this data" section for provenance/context caveats
 * (how the data is collected, known coverage gaps). The urgent per-view accuracy
 * warnings — same-day and terminus — stay visible with the charts instead (see
 * TripExplorer). Only bus and Commuter Rail carry provenance notes today, so the
 * section is omitted entirely for other lines.
 */
export const TripDataNotes: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();
  const isBus = line === 'line-bus' || linePath === 'bus';
  const isCommuterRail = line === 'line-commuter-rail' || linePath === 'commuter-rail';

  if (!isBus && !isCommuterRail) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="bg-card ring-foreground/10 rounded-xl px-4 ring-1"
    >
      <AccordionItem value="about-this-data">
        <AccordionTrigger className="text-muted-foreground">
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleInfo} className="size-4" aria-hidden />
            About this data
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <BetaDataNotice />
          <GobbleDataNotice />
          <BusDataNotice />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

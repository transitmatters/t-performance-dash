import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface DataNotesProps {
  title?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The collapsed-by-default "About this data" card that closes out a page: provenance, method,
 * known gaps. One shell for every page so the notes read the same under Delays, Predictions and
 * the trip explorer alike.
 */
export const DataNotes: React.FC<DataNotesProps> = ({ title = 'About this data', children }) => (
  <Accordion
    type="single"
    collapsible
    className="rounded-xl bg-card px-4 ring-1 ring-foreground/10"
  >
    <AccordionItem value="about-this-data">
      <AccordionTrigger className="text-muted-foreground">
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCircleInfo} className="size-4" aria-hidden />
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 text-muted-foreground">
        {children}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

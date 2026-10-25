import type { ReactNode } from 'react';
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface AccordionProps {
  contentList: {
    title: string;
    content: string | ReactNode;
  }[];
  size?: 'md' | 'lg';
}

export const Accordion = ({ contentList, size = 'md' }: AccordionProps) => {
  return (
    <div className="w-full">
      <AccordionRoot type="multiple" className="mx-auto w-full rounded-2xl bg-white p-2">
        {contentList.map(({ title, content }) => (
          <AccordionItem key={title} value={title}>
            <AccordionTrigger className={size === 'lg' ? 'text-lg' : 'text-base'}>
              {title}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-stone-500">{content}</AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    </div>
  );
};

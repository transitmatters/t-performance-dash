import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { FC, ReactNode } from 'react';

import { queryClient } from '../api/queryClient';
import { TooltipProvider } from '@/common/components/ui/tooltip';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TooltipProvider>
        <div className="flex h-screen flex-col">
          <div className="relative h-full">{children}</div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

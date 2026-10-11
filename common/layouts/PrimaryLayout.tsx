import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

import { queryClient } from '../api/queryClient';
import { TooltipProvider } from '@/common/components/ui/tooltip';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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

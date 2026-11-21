import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

import { queryClient } from '../api/queryClient';
import { TooltipProvider } from '@/common/components/ui/tooltip';
import { ChartHoverCard } from '@/common/components/charts/hoverCard/ChartHoverCard';

interface AppProvidersProps {
  children?: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TooltipProvider>
        <div className="flex h-screen flex-col">
          <div className="relative h-full">{children}</div>
        </div>
        <ChartHoverCard />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

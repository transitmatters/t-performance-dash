import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

import { TooltipProvider } from '@/common/components/ui/tooltip';

interface LayoutProps {
  children?: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 10000, // 10 seconds
    },
  },
});

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

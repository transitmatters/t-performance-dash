import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

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
      <ReactQueryDevtools buttonPosition="top-left" />
      <div className="flex h-screen flex-col">
        <main className="relative h-full">{children}</main>
      </div>
    </QueryClientProvider>
  );
};

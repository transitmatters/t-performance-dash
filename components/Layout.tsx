import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 10000, // 10 seconds
    },
  },
});

export const Layout = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen flex-col">
        <main className="relative h-full">{children}</main>
      </div>
    </QueryClientProvider>
  );
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Navbar } from './Navbar';

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
      <div className="flex flex-col">
        <Navbar />
        <main className="relative top-11 sm:top-16">{children}</main>
      </div>
    </QueryClientProvider>
  );
};

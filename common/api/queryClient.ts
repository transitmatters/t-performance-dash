import { QueryClient } from '@tanstack/react-query';

// Shared with route loaders, which prefetch before a page's component mounts.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 10000, // 10 seconds
    },
  },
});

'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { Layout } from '../components/Layout';
import '../styles/dashboard.css';
import '../styles/globals.css';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 10000, // 10 seconds
    },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}

//  Leaving this temporarily after switching from `app` to `pages` directory. Didn't implement everything completely.
// }
// const App = ({
//   // Layouts must accept a children prop.
//   // This will be populated with nested layouts or pages
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   return (
//     <html lang="en" className="font-sans h-full bg-tm-grey">
//       <Head>
//         <title>Dashboard</title>
//       </Head>
//       <body className="bg-white">
//         <QueryClientProvider client={queryClient}>
//           {/* <Layout>{children}</Layout> */}
//           <div><p>test</p></div>
//           <ReactQueryDevtools />
//         </QueryClientProvider>
//       </body>
//     </html>
//   );
// }

// eslint-disable-next-line import/no-default-export
// export default App;

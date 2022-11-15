'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Layout } from '../components/Layout';
import '../styles/dashboard.css';
import '../styles/globals.css';
const queryClient = new QueryClient();

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-100 font-sans">
      <head>
        <title>Dashboard</title>
      </head>
      <body className="h-full ">
        <QueryClientProvider client={queryClient}>
          <Layout>{children}</Layout>
        </QueryClientProvider>
      </body>
    </html>
  );
}

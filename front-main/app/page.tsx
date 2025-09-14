
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/apolloClient";
import { useState } from "react";
import MainLayout from "../layout";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import PerformanceMonitor from "@/components/common/PerformanceMonitor";
import SEOMonitor from "@/components/common/SEOMonitor";

// Import home page component
import HomePage from "../app/home";

export default function Home() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <GoogleAnalytics />
        <PerformanceMonitor />
        <SEOMonitor />
        <MainLayout>
          <HomePage />
        </MainLayout>
      </ApolloProvider>
    </QueryClientProvider>
  );
}

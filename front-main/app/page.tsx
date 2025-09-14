
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/apolloClient";
import { useState } from "react";
import MainLayout from "@/layout";

// Import home page component - App Router uchun to'g'ri yo'l
import HomePage from "./home";

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
        <MainLayout>
          <HomePage />
        </MainLayout>
      </ApolloProvider>
    </QueryClientProvider>
  );
}

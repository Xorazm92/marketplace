
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/apolloClient";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
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
        <AppLayout>
          <HomePage />
        </AppLayout>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
